using Domain.Entities;
using Domain.IRepositories;
using Models;
using Models.Base;
using Services.Abstractions;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

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
		public async Task<UserModel> CreateAsync(UserModel userModel)
		{
			try
			{
				var entity = ModelConverter.UserViewModelToModel(userModel);
				userModel.id = Guid.NewGuid();
				var res = await _repositoryManager._userRepository.AddAsync(entity);
				return ModelConverter.UserModelToViewModel(res);
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<UserModel>.ErrorFormat(ex);
			}
		}

		/// <summary>
		/// метод удаления записи о пользователе
		/// </summary>
		/// <param name="userId"></param>
		/// <returns></returns>
		public async Task<UserModel> DeleteUserAsync(Guid userId)
		{
			try
			{
				var existing_entity = await _repositoryManager._userRepository.GetByIdAsync(userId);
				if(existing_entity != null)
				{
					await _repositoryManager._userRepository.DeleteAsync(existing_entity);
					return new UserModel()
					{
						Result = Models.CommonData.DefaultEnums.Result.ok
					};
				}
				else
				{
					return new UserModel
					{
						Result = Models.CommonData.DefaultEnums.Result.error,
						Error = new Exception("Произошла ошибка при удалении данного пользователя! ")
					};
				}
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<UserModel>.ErrorFormat(ex);
			}
		}

		/// <summary>
		/// метод получения таблицы пользователей
		/// </summary>
		/// <param name="search"></param>
		/// <returns></returns>
		public async Task<DataTableModel.DtResponse<UserModel>> GetAllUsersAsync(string search = null)
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
				var result = new List<UserModel>();
				if(userList != null)
				{
					foreach (var item in userList)
						result.Add(ModelConverter.UserModelToViewModel(item));
				}		

				return new DataTableModel.DtResponse<UserModel>
				{
					data = result,
					recordsFiltered = result.Count,
					recordsTotal = result.Count,
					Result = Models.CommonData.DefaultEnums.Result.ok

				};
			}
			catch(Exception ex)
			{
				return new DataTableModel.DtResponse<UserModel>()
				{ 
					Result = Models.CommonData.DefaultEnums.Result.error,
					message = ex.Message
				};
			}
		}
		/// <summary>
		/// метод получения пользователя по ID
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		public async Task<UserModel> GetByIdAsync(Guid Id)
		{
			try
			{
				var entity = await _repositoryManager._userRepository.GetByIdAsync(Id);
				if (entity != null)
				{
					return ModelConverter.UserModelToViewModel(entity);
				}
				else return new UserModel() { Error = new Exception("Пользователь не найден!") };
			}
			catch(Exception ex)
			{
				return BaseModelUtilities<UserModel>.ErrorFormat(ex);
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
					existing_entity.is_removed = !existing_entity.is_removed;
					await _repositoryManager._userRepository.UpdateAsync(existing_entity);
					return true;
				}
				else return false;

			}
			catch (Exception ex)
			{
				return false;
			}
		}

		/// <summary>
		/// метод обновления записи о пользователе
		/// </summary>
		/// <param name="userModel"></param>
		/// <returns></returns>
		public async Task<UserModel> UpdateAsync(UserModel userModel)
		{
			try
			{
				var existing_entity = await _repositoryManager._userRepository.GetByIdAsync(userModel.id);
				if (existing_entity != null)
				{
					existing_entity.firstname = userModel.firstname;
					existing_entity.lastname = userModel.lastname;
					existing_entity.email = userModel.email;
					await _repositoryManager._userRepository.UpdateAsync(existing_entity);
					return userModel;
				}
				else return new UserModel();
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<UserModel>.ErrorFormat(ex);
			}
		}
	}
}
