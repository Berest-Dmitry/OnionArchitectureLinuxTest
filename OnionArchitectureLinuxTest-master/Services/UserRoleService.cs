using Domain.Entities;
using Domain.IRepositories;
using Contracts;
using Contracts.Base;
using Contracts.CommonData;
using Services.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Contracts.Models;
using Domain.Exceptions;

namespace Services
{
	public class UserRoleService: IUserRoleService
	{
		private readonly IRepositoryManager _repositoryManager;

		public UserRoleService(IRepositoryManager repositoryManager)
		{
			_repositoryManager = repositoryManager ?? throw new ArgumentNullException(nameof(repositoryManager));
		}

		/// <summary>
		/// метод прикрепления роли к пользователю
		/// </summary>
		/// <param name="UserId"></param>
		/// <param name="roleId"></param>
		/// <returns></returns>
		public async Task<BaseResponseModel<UserRolesDto>> AttachRoleToUser(Guid UserId, Guid RoleId)
		{
			try
			{
				var result = await _repositoryManager._userRolesRepository.AttachRoleToUser(UserId, RoleId);
				if(result.Id == Guid.Empty)
				{
					return new BaseResponseModel < UserRolesDto >()
					{
						Result = DefaultEnums.Result.error,
						Error = new Exception("Данные пользователь и роль уже были связаны")
					};
				}
				//return ModelConverter.UserRolesModelToViewModel(result);
				var resultModel = ObjectMapper.Mapper.Map<UserRolesDto>(result);
				return new BaseResponseModel<UserRolesDto>
				{
					Entity = resultModel,
					Result = DefaultEnums.Result.ok
				};
			}
			catch (Exception ex)
			{
				//return BaseModelUtilities<UserRolesDto>.ErrorFormat(ex);
				return new BaseResponseModel<UserRolesDto>
				{
					Result = DefaultEnums.Result.error,
					Error = ex,
				};
			}
		}

		/// <summary>
		/// метод открепления роли пользователя
		/// </summary>
		/// <param name="UserId"></param>
		/// <param name="RoleId"></param>
		/// <returns></returns>
		public async Task<BaseResponseModel<UserRolesDto>> DetachRoleFromUser(Guid UserId, Guid RoleId)
		{
			try
			{
				var result = await _repositoryManager._userRolesRepository.DetachRoleFromUser(UserId, RoleId);
				if (result.Id == Guid.Empty)
				{
					return new BaseResponseModel <UserRolesDto>()
					{
						Result = DefaultEnums.Result.error,
						Error = new Exception("Данные пользователь и роль не связаны в настоящий момент")
					};
				}
				var resultModel =  ObjectMapper.Mapper.Map<UserRolesDto>(result);
				return new BaseResponseModel<UserRolesDto>
				{
					Entity = resultModel,
					Result = DefaultEnums.Result.ok
				};

			}
			catch (Exception ex)
			{
				//return BaseModelUtilities<UserRolesDto>.ErrorFormat(ex);
				return new BaseResponseModel<UserRolesDto>
				{
					Result = DefaultEnums.Result.error,
					Error = ex,
				};
			}
		}

		/// <summary>
		/// метод получения всех названий ролей
		/// </summary>
		/// <param name="userId"></param>
		/// <returns></returns>
		public async Task<BaseResponseModel<List<RoleDto>>> GetAllRoleNames(Guid? userId = null)
		{
			try
			{
				var all_roles = new List<RoleDto>();
				var role_list = new List<Role>();
				if (userId == null || userId == Guid.Empty)
				{
					role_list = await _repositoryManager._roleRepository.GetAllAsync()
						as List<Role>;
					foreach (var role in role_list)
						all_roles.Add(ObjectMapper.Mapper.Map<RoleDto>(role));
				}
				else
				{
					var items = await _repositoryManager._userRolesRepository
						.GetAsync(ur => ur.UserId == userId) as List<UserRoles>;
					var roles = await _repositoryManager._roleRepository
						.GetAsync(r => items.Select(x => x.RoleId).Contains(r.Id)) as List<Role>;

					foreach (var role in roles)
						all_roles.Add(ObjectMapper.Mapper.Map<RoleDto>(role));
				}
				//return all_roles;
				//return new ListResponseModel<RoleDto>
				//{
				//	Entities = all_roles,
				//	Result = DefaultEnums.Result.ok
				//};
				return new BaseResponseModel<List<RoleDto>>(all_roles);
			}
			catch(Exception ex)
			{
				//return new List<RoleDto>();
				return new BaseResponseModel<List<RoleDto>>(ex);
			}
		}

		/// <summary>
		/// метод получения всех ФИО пользователей
		/// </summary>
		/// <returns></returns>
		public async Task<BaseResponseModel<List<UserShortModel>>> GetAllUserNames()
		{
			try
			{
				var userNames = new List<UserShortModel>();
				var users_list = await _repositoryManager._userRepository.GetAllAsync();
				foreach(var item in users_list)
				{
					userNames.Add(new UserShortModel()
					{
						id = item.Id,
						UserName = item.FirstName + " " + item.LastName
					});
				}
				//return userNames;
				return new BaseResponseModel<List<UserShortModel>>(userNames);
			}
			catch (Exception ex)
			{
				return new BaseResponseModel<List<UserShortModel>>(ex);
				////return new List<UserShortModel>();
				//throw new UsersTableNotBuiltException(ex.Message);
			}
		}
	}
}
