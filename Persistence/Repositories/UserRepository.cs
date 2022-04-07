using Domain.Entities;
using Domain.IRepositories;
using Persistence.Repositories.Base;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Persistence.Repositories
{
	/// <summary>
	/// репозиторий пользователей
	/// </summary>
	public class UserRepository : BaseRepository<User>, IUserRepository
	{
		public UserRepository(ApplicationContext context) : base(context) { }

		/// <summary>
		/// поиск пользователей по имени
		/// </summary>
		/// <param name="search"></param>
		/// <returns></returns>
		public async Task<List<User>> GetUsersBySearch(string search)
		{
			try
			{
				search = search.ToLower().Trim();
				var user_list = await GetAsync(u => u.firstname.ToLower().Contains(search)
				|| u.lastname.ToLower().Contains(search)
				|| (u.firstname.ToLower() + " " + u.lastname.ToLower()).Contains(search));

				if (user_list != null)
					return user_list as List<User>;
				else return new List<User>();
			}
			catch (Exception ex)
			{
				return new List<User>();
			}
		}

	}
}
