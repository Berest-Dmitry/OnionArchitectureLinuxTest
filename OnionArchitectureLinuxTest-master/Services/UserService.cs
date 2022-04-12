using Domain.Entities;
using Domain.IRepositories;
using Contracts;
using Contracts.Base;
using Services.Abstractions;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Contracts.Models;

namespace Services
{
	public class UserService: IUserService
	{
		private readonly IRepositoryManager _repositoryManager;

		public UserService(IRepositoryManager repositoryManager)
		{
			_repositoryManager = repositoryManager ?? throw new ArgumentNullException(nameof(repositoryManager));
		}

		/// <summary>
		/// метод создания записи о пользователе
		/// </summary>
		/// <param name="userModel"></param>
		/// <returns></returns>
		public async Task<UserDto> CreateAsync(UserDto userModel)
		{
			try
			{
				//var entity = ModelConverter.UserViewModelToModel(userModel);
				var entity = ObjectMapper.Mapper.Map<User>(userModel);
				userModel.id = Guid.NewGuid();
				var res = await _repositoryManager._userRepository.AddAsync(entity);
				//return ModelConverter.UserModelToViewModel(res);
				return ObjectMapper.Mapper.Map<UserDto>(res);
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<UserDto>.ErrorFormat(ex);
			}
		}

		/// <summary>
		/// метод удаления записи о пользователе
		/// </summary>
		/// <param name="userId"></param>
		/// <returns></returns>
		public async Task<UserDto> DeleteUserAsync(Guid userId)
		{
			try
			{
				var existing_entity = await _repositoryManager._userRepository.GetByIdAsync(userId);
				if(existing_entity != null)
				{
					await _repositoryManager._userRepository.DeleteAsync(existing_entity);
					return new UserDto()
					{
						Result = Contracts.CommonData.DefaultEnums.Result.ok
					};
				}
				else
				{
					return new UserDto
					{
						Result = Contracts.CommonData.DefaultEnums.Result.error,
						Error = new Exception("Произошла ошибка при удалении данного пользователя! ")
					};
				}
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<UserDto>.ErrorFormat(ex);
			}
		}

		/// <summary>
		/// метод получения таблицы пользователей
		/// </summary>
		/// <param name="search"></param>
		/// <returns></returns>
		public async Task<DataTableModel.DtResponse<UserDto>> GetAllUsersAsync(string search = null)
		{
			try
			{
				var userList = new List<User>();
				if (string.IsNullOrEmpty(search))
				{
					userList = await _repositoryManager._userRepository.GetAllAsync() as List<User>;
				}
				else
				{
					userList = await _repositoryManager._userRepository.GetUsersBySearch(search);
				}
				var result = new List<UserDto>();
				if(userList != null)
				{
					foreach (var item in userList)
					{
						//result.Add(ModelConverter.UserModelToViewModel(item));
						result.Add(ObjectMapper.Mapper.Map<UserDto>(item));
					}				
				}		

				return new DataTableModel.DtResponse<UserDto>
				{
					data = result,
					recordsFiltered = result.Count,
					recordsTotal = result.Count,
					Result = Contracts.CommonData.DefaultEnums.Result.ok

				};
			}
			catch(Exception ex)
			{
				return new DataTableModel.DtResponse<UserDto>()
				{ 
					Result = Contracts.CommonData.DefaultEnums.Result.error,
					message = ex.Message
				};
			}
		}
		/// <summary>
		/// метод получения пользователя по ID
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		public async Task<UserDto> GetByIdAsync(Guid Id)
		{
			try
			{
				var entity = await _repositoryManager._userRepository.GetByIdAsync(Id);
				if (entity != null)
				{
					//return ModelConverter.UserModelToViewModel(entity);
					return ObjectMapper.Mapper.Map<UserDto>(entity);
				}
				else return new UserDto() { Error = new Exception("Пользователь не найден!") };
			}
			catch(Exception ex)
			{
				return BaseModelUtilities<UserDto>.ErrorFormat(ex);
			}
		}

		/// <summary>
		/// метод пометки пользователя (не)удаленным
		/// </summary>
		/// <param name="IsRemoved"></param>
		/// <param name="userId"></param>
		/// <returns></returns>
		public async Task<bool> MarkUserAsRemoved(Guid userId)
		{
			try
			{
				var existing_entity = await _repositoryManager._userRepository.GetByIdAsync(userId);
				if (existing_entity != null)
				{
					existing_entity.IsRemoved = !existing_entity.IsRemoved;
					await _repositoryManager._userRepository.UpdateAsync(existing_entity);
					return true;
				}
				else return false;

			}
			catch (Exception ex)
			{
				throw new Exception(ex.Message);
			}
		}

		/// <summary>
		/// метод обновления записи о пользователе
		/// </summary>
		/// <param name="userModel"></param>
		/// <returns></returns>
		public async Task<UserDto> UpdateAsync(UserDto userModel)
		{
			try
			{
				var existing_entity = await _repositoryManager._userRepository.GetByIdAsync(userModel.id);
				if (existing_entity != null)
				{
					existing_entity.FirstName = userModel.firstName;
					existing_entity.LastName = userModel.lastName;
					existing_entity.Email = userModel.email;
					await _repositoryManager._userRepository.UpdateAsync(existing_entity);
					return userModel;
				}
				else return new UserDto();
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<UserDto>.ErrorFormat(ex);
			}
		}
	}
}
