using Domain.Entities;
using Domain.IRepositories;
using Persistence.Repositories.Base;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Persistence.Repositories
{
	public class RoleRepository : BaseRepository<Role>, IRoleRepository
	{
		public RoleRepository(ApplicationContext context) : base(context) { }

		/// <summary>
		/// поиск ролей по наименованию
		/// </summary>
		/// <param name="search"></param>
		/// <returns></returns>
		public async Task<List<Role>> GetRolesBySearch(string search)
		{
			try
			{
				search = search.ToLower().Trim();
				var roles_list = await GetAsync(r => r.rolename.ToLower()
				.Contains(search)) as List<Role>;

				if (roles_list != null)
					return roles_list;
				else return new List<Role>();
			}
			catch (Exception ex)
			{
				return new List<Role>();
			}
		}
	}
}
