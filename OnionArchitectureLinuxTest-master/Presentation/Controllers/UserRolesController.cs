using Microsoft.AspNetCore.Mvc;
using Contracts;
using Contracts.Base;
using Services.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Contracts.Models;
//using System.Web.Mvc;

namespace Presentation.Controllers
{
	/*[ApiController]
	[Route("api/userroles")]*/
	public class UserRolesController : Controller
	{
		public IActionResult Index()
		{
			//return (IActionResult)View();
			return View();
		}

		public IActionResult UserRoles()
		{
			//return View("UserRoles");
			return View(@"\Features\UserRoles\UserRoles");
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
				return new List<RoleDto>();
			}
		}

		/// <summary>
		/// метод прикрепления роли
		/// </summary>
		/// <param name="userId"></param>
		/// <param name="roleId"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<UserRolesDto> AttachRoleToUser(string userId, string roleId)
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
				return BaseModelUtilities<UserRolesDto>.ErrorFormat(ex);
			}
		}

		/// <summary>
		/// метод открепления роли
		/// </summary>
		/// <param name="userId"></param>
		/// <param name="roleId"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<UserRolesDto> DetachRoleFromUser(string userId, string roleId)
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
				return BaseModelUtilities<UserRolesDto>.ErrorFormat(ex);
			}
		}
	}
}
