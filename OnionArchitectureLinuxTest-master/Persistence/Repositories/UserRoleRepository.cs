using Domain.Entities;
using Domain.IRepositories;
using Persistence.Repositories.Base;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Persistence.Repositories
{
	public class UserRoleRepository : BaseRepository<UserRoles>, IUserRolesRepository
	{
		public UserRoleRepository(ApplicationContext context) : base(context) { }

		/// <summary>
		/// метод прикрепления роли к пользователю
		/// </summary>
		/// <param name="userId"></param>
		/// <param name="roleId"></param>
		/// <returns></returns>
		public async Task<UserRoles> AttachRoleToUser(Guid userId, Guid roleId)
		{
			try
			{
				var finded_root = await GetAsync(ur => ur.UserId == userId
				&& ur.RoleId == roleId);
				if (finded_root.Count == 0)
				{
					var new_entity = new UserRoles
					{
						Id = Guid.NewGuid(),
						UserId = userId,
						RoleId = roleId
					};
					var res = await AddAsync(new_entity);
					return res;
				}
				else
				{
					return new UserRoles();
				}
			}
			catch (Exception ex)
			{
				throw new Exception(ex.Message);
			}
		}

		/// <summary>
		/// метод удаления роли пользователя
		/// </summary>
		/// <param name="userId"></param>
		/// <param name="roleId"></param>
		/// <returns></returns>
		public async Task<UserRoles> DetachRoleFromUser(Guid userId, Guid roleId)
		{
			try
			{
				var finded_root = await GetAsync(ur => ur.UserId == userId
				&& ur.RoleId == roleId);
				if (finded_root.Count > 0)
				{
					var root = finded_root[0];
					await DeleteAsync(root);
					return root;
				}
				return new UserRoles();
			}
			catch (Exception ex)
			{
				throw new Exception(ex.Message);
			}
		}

	}
}
