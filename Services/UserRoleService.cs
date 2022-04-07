using Domain.Entities;
using Domain.IRepositories;
using Models;
using Models.Base;
using Models.CommonData;
using Services.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
		public async Task<UserRolesModel> AttachRoleToUser(Guid UserId, Guid RoleId)
		{
			try
			{
				var result = await _repositoryManager._userRolesRepository.AttachRoleToUser(UserId, RoleId);
				if(result.id == Guid.Empty)
				{
					return new UserRolesModel()
					{
						Result = DefaultEnums.Result.error,
						Error = new Exception("Данные пользователь и роль уже были связаны")
					};
				}
				return ModelConverter.UserRolesModelToViewModel(result);
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<UserRolesModel>.ErrorFormat(ex);
			}
		}

		/// <summary>
		/// метод открепления роли пользователя
		/// </summary>
		/// <param name="UserId"></param>
		/// <param name="RoleId"></param>
		/// <returns></returns>
		public async Task<UserRolesModel> DetachRoleFromUser(Guid UserId, Guid RoleId)
		{
			try
			{
				var result = await _repositoryManager._userRolesRepository.DetachRoleFromUser(UserId, RoleId);
				if (result.id == Guid.Empty)
				{
					return new UserRolesModel()
					{
						Result = DefaultEnums.Result.error,
						Error = new Exception("Данные пользователь и роль не связаны в настоящий момент")
					};
				}
				return ModelConverter.UserRolesModelToViewModel(result);

			}
			catch (Exception ex)
			{
				return BaseModelUtilities<UserRolesModel>.ErrorFormat(ex);
			}
		}

		/// <summary>
		/// метод получения всех названий ролей
		/// </summary>
		/// <param name="userId"></param>
		/// <returns></returns>
		public async Task<List<RoleModel>> GetAllRoleNames(Guid? userId = null)
		{
			try
			{
				var all_roles = new List<RoleModel>();
				var role_list = new List<Role>();
				if (userId == null || userId == Guid.Empty)
				{
					role_list = await _repositoryManager._roleRepository.GetAllAsync()
						as List<Role>;
					foreach (var role in role_list)
						all_roles.Add(ModelConverter.RoleModelToViewModel(role));
				}
				else
				{
					var items = await _repositoryManager._userRolesRepository
						.GetAsync(ur => ur.userid == userId) as List<UserRoles>;
					var roles = await _repositoryManager._roleRepository
						.GetAsync(r => items.Select(x => x.roleid).Contains(r.id)) as List<Role>;

					foreach (var role in roles)
						all_roles.Add(ModelConverter.RoleModelToViewModel(role));
				}
				return all_roles;
			}
			catch(Exception ex)
			{
				return new List<RoleModel>();
			}
		}

		/// <summary>
		/// метод получения всех ФИО пользователей
		/// </summary>
		/// <returns></returns>
		public async Task<List<UserShortModel>> GetAllUserNames()
		{
			try
			{
				var userNames = new List<UserShortModel>();
				var users_list = await _repositoryManager._userRepository.GetAllAsync();
				foreach(var item in users_list)
				{
					userNames.Add(new UserShortModel()
					{
						id = item.id,
						UserName = item.firstname + " " + item.lastname
					});
				}
				return userNames;
			}
			catch (Exception ex)
			{
				return new List<UserShortModel>();
			}
		}
	}
}
