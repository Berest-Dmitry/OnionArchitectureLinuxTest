//using Microsoft.AspNetCore.Mvc;
using Contracts.Base;
using Contracts.CommonData;
using Services.Abstractions;
using System;
using System.Linq;
using System.Threading.Tasks;
using Contracts.Models;
using Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;
//using System.Web.Mvc;

namespace Presentation.Controllers {
	public class UserController : Controller {
		public IActionResult Index() {
			return View();
		}
		public IActionResult Users()
		{
			return View(@"\Views\User\Users.cshtml");
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
			catch (UsersTableNotBuiltException ex)
			{
				return new DataTableModel.DtResponse<UserDto>();
			}
		}

		/// <summary>
		/// удаление пользователя
		/// </summary>
		/// <param name="thisUser"></param>
		/// <returns></returns>
		[HttpPost]
		//[AllowAnonymous]
		public async Task<BaseResponseModel<UserDto>> DeleteThisUser(Guid thisUser)
		{
			try
			{
				var delResult = await _serviceManager._userService.DeleteUserAsync(thisUser);
				if (delResult.Result == DefaultEnums.Result.ok)
				{
					return new BaseResponseModel < UserDto >()
					{
						Result = DefaultEnums.Result.ok
					};
				}
				else
				{
					return new BaseResponseModel<UserDto>()
					{
						Result = DefaultEnums.Result.error,
						Error = delResult.Error
					};
				}
			}
			catch (UserNotFoundException ex)
			{
				return new BaseResponseModel<UserDto>
				{
					Result = DefaultEnums.Result.error,
					Error = ex,
				};
			}
		}

		/// <summary>
		/// метод обновления данных о выбранном пользователе
		/// </summary>
		/// <param name="user"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<BaseResponseModel<UserDto>> UpdateThisUser(UserDto user)
		{
			try
			{
				var result = new BaseResponseModel<UserDto>();
				if (user != null)
					result = await _serviceManager._userService.UpdateAsync(user);
				return result;

			}
			catch (UserNotFoundException ex)
			{
				return new BaseResponseModel<UserDto>
				{
					Result = DefaultEnums.Result.error,
					Error = ex,
				};
			}
		}
		/// <summary>
		/// получение пользователя для редактирования
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		[HttpGet]
		public async Task<BaseResponseModel<UserDto>> GetUserToEdit(Guid Id)
		{
			try
			{
				var result = await _serviceManager._userService.GetByIdAsync(Id);
				return result;
			}
			catch (UserNotFoundException ex)
			{
				return new BaseResponseModel<UserDto>
				{
					Result = DefaultEnums.Result.error,
					Error = ex,
				};
			}
		}
		/// <summary>
		/// создание нового пользователя
		/// </summary>
		/// <param name="userModel"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<BaseResponseModel<UserDto>> CreateNewUser(UserDto userModel)
		{
			try
			{
				var result = await _serviceManager._userService.CreateAsync(userModel);
				return result;
			}
			catch (Exception ex)
			{
				return new BaseResponseModel<UserDto>
				{
					Result = DefaultEnums.Result.error,
					Error = ex,
				};
			}
		}

		[HttpPost]
		public async Task<BaseResponseModel<UserDto>> MarkUserAsRemoved(Guid thisId)
		{
			try
			{

				var res = await _serviceManager._userService.MarkUserAsRemoved(thisId);
				return new BaseResponseModel<UserDto>
				{
					Result = DefaultEnums.Result.ok,
					Entity = new UserDto
					{
						isRemoved = res
					}
				};
			}
			catch(UserNotFoundException ex)
			{
				return new BaseResponseModel<UserDto>
				{
					Result = DefaultEnums.Result.error,
					Error = ex,
				};
			}
		}
	}
}
