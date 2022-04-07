using Contracts;
using Contracts.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Services.Abstractions
{
	/// <summary>
	/// интерфейс связи пользователей и ролей
	/// </summary>
	public interface IUserRoleService
	{
		/// <summary>
		/// метод получения всех ФИО пользователей
		/// </summary>
		/// <returns></returns>
		Task<List<UserShortModel>> GetAllUserNames();
		/// <summary>
		/// метод получения всех названий ролей
		/// </summary>
		/// <param name="userId"></param>
		/// <returns></returns>
		Task<List<RoleModel>> GetAllRoleNames(Guid? userId = null);
		/// <summary>
		/// метод прикрепления роли к пользователю
		/// </summary>
		/// <param name="UserId"></param>
		/// <param name="roleId"></param>
		/// <returns></returns>
		Task<UserRolesModel> AttachRoleToUser(Guid UserId, Guid RoleId);
		/// <summary>
		/// метод открепления роли пользователя
		/// </summary>
		/// <param name="UserId"></param>
		/// <param name="RoleId"></param>
		/// <returns></returns>
		Task<UserRolesModel> DetachRoleFromUser(Guid UserId, Guid RoleId);
	}
}
