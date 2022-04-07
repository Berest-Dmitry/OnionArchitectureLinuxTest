using Domain.Entities;
using Domain.IRepositories.Base;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Domain.IRepositories
{
	public interface IUserRepository : IRepository<User>
	{
		/// <summary>
		/// поиск пользователей по имени
		/// </summary>
		/// <param name="search"></param>
		/// <returns></returns>
		Task<List<User>> GetUsersBySearch(string search);
	}
}
