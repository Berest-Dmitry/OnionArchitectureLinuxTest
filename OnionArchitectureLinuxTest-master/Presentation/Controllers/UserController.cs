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

namespace Presentation.Controllers
{
	/*[ApiController]
	[Route("api/user")]*/
	public class UserController : Controller
	{
		public IActionResult Index()
		{
			//return (IActionResult)RedirectToAction();
			return View();
		}
		public IActionResult Users()
		{
			//return RedirectToAction("Users", "User");
			return View(@"\Features\User\Users");
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
		public async Task<UserDto> DeleteThisUser(Guid thisUser)
		{
			try
			{
				var delResult = await _serviceManager._userService.DeleteUserAsync(thisUser);
				if (delResult.Result == DefaultEnums.Result.ok)
				{
					return new UserDto()
					{
						Result = DefaultEnums.Result.ok
					};
				}
				else
				{
					return new UserDto()
					{
						Result = DefaultEnums.Result.error,
						Error = delResult.Error
					};
				}
			}
			catch (UserNotFoundException ex)
			{
				return BaseModelUtilities<UserDto>.ErrorFormat(ex);
			}
		}

		/// <summary>
		/// метод обновления данных о выбранном пользователе
		/// </summary>
		/// <param name="user"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<UserDto> UpdateThisUser(UserDto user)
		{
			try
			{
				var result = new UserDto();
				if (user != null)
					result = await _serviceManager._userService.UpdateAsync(user);
				return result;

			}
			catch (UserNotFoundException ex)
			{
				return BaseModelUtilities<UserDto>.ErrorFormat(ex);
			}
		}
		/// <summary>
		/// получение пользователя для редактирования
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		[HttpGet]
		public async Task<UserDto> GetUserToEdit(Guid Id)
		{
			try
			{
				var result = await _serviceManager._userService.GetByIdAsync(Id);
				return result;
			}
			catch (UserNotFoundException ex)
			{
				return BaseModelUtilities<UserDto>.ErrorFormat(ex);
			}
		}
		/// <summary>
		/// создание нового пользователя
		/// </summary>
		/// <param name="userModel"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<UserDto> CreateNewUser(UserDto userModel)
		{
			try
			{
				var result = await _serviceManager._userService.CreateAsync(userModel);
				return result;
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<UserDto>.ErrorFormat(ex);
			}
		}

		[HttpPost]
		public async Task<UserDto> MarkUserAsRemoved(string thisId)
		{
			try
			{
				Guid userId = Guid.Empty;
				Guid.TryParse(thisId, out userId);
				var res = await _serviceManager._userService.MarkUserAsRemoved(userId);
				return new UserDto
				{
					Result = DefaultEnums.Result.ok,
					isRemoved = res
				};
			}
			catch(UserNotFoundException ex)
			{
				return BaseModelUtilities<UserDto>.ErrorFormat(ex);
			}
		}
	}
}
