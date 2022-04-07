using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Models;
using Models.Base;
using Models.CommonData;
using Services.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OnionArcitectureLinuxTest1.Controllers
{
	public class UserController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}
		public ActionResult Users()
		{
			return View("Users");
		}

		private readonly IServiceManager _serviceManager;

		public UserController(IServiceManager serviceManager)
		{
			_serviceManager = serviceManager ?? throw new ArgumentNullException(nameof(serviceManager));
		}

		/// <summary>
		/// получение всех пользователей
		/// </summary>
		/// <returns></returns>
		[HttpPost]
		public async Task<object> GetAllExistingUsers()
		{
			try
			{
				var search = Request.Form["search[value]"].FirstOrDefault();
				var res = await _serviceManager._userService.GetAllUsersAsync(search);
				return res;
			}
			catch (Exception ex)
			{
				return new DataTableModel.DtResponse<UserModel>();
			}
		}

		/// <summary>
		/// удаление пользователя
		/// </summary>
		/// <param name="thisUser"></param>
		/// <returns></returns>
		[HttpPost]
		//[AllowAnonymous]
		public async Task<UserModel> DeleteThisUser(Guid thisUser)
		{
			try
			{
				var delResult = await _serviceManager._userService.DeleteUserAsync(thisUser);
				if (delResult.Result == DefaultEnums.Result.ok)
				{
					return new UserModel()
					{
						Result = DefaultEnums.Result.ok
					};
				}
				else
				{
					return new UserModel()
					{
						Result = DefaultEnums.Result.error,
						Error = delResult.Error
					};
				}
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<UserModel>.ErrorFormat(ex);
			}
		}

		/// <summary>
		/// метод обновления данных о выбранном пользователе
		/// </summary>
		/// <param name="user"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<UserModel> UpdateThisUser(UserModel user)
		{
			try
			{
				var result = new UserModel();
				if (user != null)
					result = await _serviceManager._userService.UpdateAsync(user);
				return result;

			}
			catch (Exception ex)
			{
				return BaseModelUtilities<UserModel>.ErrorFormat(ex);
			}
		}
		/// <summary>
		/// получение пользователя для редактирования
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		[HttpGet]
		public async Task<UserModel> GetUserToEdit(Guid Id)
		{
			try
			{
				var result = await _serviceManager._userService.GetByIdAsync(Id);
				return result;
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<UserModel>.ErrorFormat(ex);
			}
		}
		/// <summary>
		/// создание нового пользователя
		/// </summary>
		/// <param name="userModel"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<UserModel> CreateNewUser(UserModel userModel)
		{
			try
			{
				var result = await _serviceManager._userService.CreateAsync(userModel);
				return result;
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<UserModel>.ErrorFormat(ex);
			}
		}

		[HttpPost]
		public async Task<UserModel> MarkUserAsRemoved(string thisId)
		{
			try
			{
				Guid userId = Guid.Empty;
				Guid.TryParse(thisId, out userId);
				var res = await _serviceManager._userService.MarkUserAsRemoved(userId);
				return new UserModel
				{
					Result = DefaultEnums.Result.ok,
					is_removed = res
				};
			}
			catch(Exception ex)
			{
				return BaseModelUtilities<UserModel>.ErrorFormat(ex);
			}
		}
	}
}
