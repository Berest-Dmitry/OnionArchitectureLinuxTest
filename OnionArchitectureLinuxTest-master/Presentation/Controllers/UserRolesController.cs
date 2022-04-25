using Microsoft.AspNetCore.Mvc;
using Contracts;
using Contracts.Base;
using Services.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Contracts.Models;
using Domain.Exceptions;
using Contracts.CommonData;
//using System.Web.Mvc;

namespace Presentation.Controllers
{
	
	public class UserRolesController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}

		public IActionResult UserRoles()
		{
			return View(@"\Views\UserRoles\UserRoles.cshtml");
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
				throw new UsersTableNotBuiltException(ex.Message);
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
				throw new RolesTableNotBuiltException(ex.Message);
			}
		}

		/// <summary>
		/// метод прикрепления роли
		/// </summary>
		/// <param name="userId"></param>
		/// <param name="roleId"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<BaseResponseModel<UserRolesDto>> AttachRoleToUser(Guid userId, Guid roleId)
		{
			try
			{
				
				var res = await _serviceManager._userRoleService.AttachRoleToUser(userId, roleId);
				return res;
			}
			catch (Exception ex)
			{
				return new BaseResponseModel<UserRolesDto>
				{
					Result = DefaultEnums.Result.error,
					Error = ex,
				};
			}
		}

		/// <summary>
		/// метод открепления роли
		/// </summary>
		/// <param name="userId"></param>
		/// <param name="roleId"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<BaseResponseModel<UserRolesDto>> DetachRoleFromUser(Guid userId, Guid roleId)
		{
			try
			{
				
				var res = await _serviceManager._userRoleService.DetachRoleFromUser(userId, roleId);
				return res;
			}
			catch (Exception ex)
			{
				return new BaseResponseModel<UserRolesDto>
				{
					Result = DefaultEnums.Result.error,
					Error = ex,
				};
			}
		}
	}
}
