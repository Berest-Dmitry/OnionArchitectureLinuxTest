using Microsoft.AspNetCore.Mvc;
using Contracts;
using Contracts.Base;
using Services.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Contracts.Models;

namespace OnionArcitectureLinuxTest1.Controllers
{
	public class UserRolesController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}

		public ActionResult UserRoles()
		{
			return View("UserRoles");
		}

		private readonly IServiceManager _serviceManager;

		public UserRolesController(IServiceManager serviceManager)
		{
			_serviceManager = serviceManager ?? throw new ArgumentNullException(nameof(serviceManager));
		}

		/// <summary>
		/// получение списка всех пользователей
		/// </summary>
		/// <returns></returns>
		[HttpGet]
		public async Task<object> GetAllUsers()
		{
			try
			{
				var users = await _serviceManager._userRoleService.GetAllUserNames();
				return users;
			}
			catch (Exception ex)
			{
				return new List<UserShortModel>();
			}
		}
		/// <summary>
		/// получение списка ролей
		/// </summary>
		/// <param name="userId"></param>
		/// <returns></returns>
		[HttpGet]
		public async Task<object> GetRolesList(string userId = null)
		{
			try
			{
				var UserId = Guid.Empty;
				Guid.TryParse(userId, out UserId);
				var roles = await _serviceManager._userRoleService.GetAllRoleNames(UserId);
				return roles;
			}
			catch (Exception ex)
			{
				return new List<RoleModel>();
			}
		}

		/// <summary>
		/// метод прикрепления роли
		/// </summary>
		/// <param name="userId"></param>
		/// <param name="roleId"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<UserRolesModel> AttachRoleToUser(string userId, string roleId)
		{
			try
			{
				Guid UserId, RoleId;
				Guid.TryParse(userId, out UserId);
				Guid.TryParse(roleId, out RoleId);
				var res = await _serviceManager._userRoleService.AttachRoleToUser(UserId, RoleId);
				return res;
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<UserRolesModel>.ErrorFormat(ex);
			}
		}

		/// <summary>
		/// метод открепления роли
		/// </summary>
		/// <param name="userId"></param>
		/// <param name="roleId"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<UserRolesModel> DetachRoleFromUser(string userId, string roleId)
		{
			try
			{
				Guid UserId, RoleId;
				Guid.TryParse(userId, out UserId);
				Guid.TryParse(roleId, out RoleId);
				var res = await _serviceManager._userRoleService.DetachRoleFromUser(UserId, RoleId);
				return res;
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<UserRolesModel>.ErrorFormat(ex);
			}
		}
	}
}
