using Contracts;
using Contracts.Base;
using Contracts.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Services.Abstractions.Database
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
		Task<BaseResponseModel<List<UserShortModel>>> GetAllUserNames();
		/// <summary>
		/// метод получения всех названий ролей
		/// </summary>
		/// <param name="userId"></param>
		/// <returns></returns>
		Task<BaseResponseModel<List<RoleDto>>> GetAllRoleNames(Guid? userId = null);
		/// <summary>
		/// метод прикрепления роли к пользователю
		/// </summary>
		/// <param name="UserId"></param>
		/// <param name="roleId"></param>
		/// <returns></returns>
		Task<BaseResponseModel<UserRolesDto>> AttachRoleToUser(Guid UserId, Guid RoleId);
		/// <summary>
		/// метод открепления роли пользователя
		/// </summary>
		/// <param name="UserId"></param>
		/// <param name="RoleId"></param>
		/// <returns></returns>
		Task<BaseResponseModel<UserRolesDto>> DetachRoleFromUser(Guid UserId, Guid RoleId);
	}
}
