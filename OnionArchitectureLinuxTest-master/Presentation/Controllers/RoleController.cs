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
//using System.Web;

namespace Presentation.Controllers
{
	/*[ApiController]
	[Route("api/role")]*/
	public class RoleController : Controller
	{
		public IActionResult Index()
		{
			//return (IActionResult)View();
			return View();
		}

		public IActionResult Roles()
		{
			return View(@"Features\Role\Roles");
		}

		private readonly IServiceManager _serviceManager;

		public RoleController(IServiceManager serviceManager)
		{
			_serviceManager = serviceManager ?? throw new ArgumentNullException(nameof(serviceManager));
		}

		/// <summary>
		/// метод получения списка всех ролей
		/// </summary>
		/// <returns></returns>
		[HttpPost]
		public async Task<object> GetAllRoles()
		{
			try
			{
				var search = Request.Form["search[value]"].FirstOrDefault();
				var res = await _serviceManager._roleService.GetAllRolesAsync(search);
				return res;

			}
			catch (Exception ex)
			{
				throw new RolesTableNotBuiltException(ex.Message);
			}
		}
		/// <summary>
		/// метод получения записи о роли для редактирования
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		[HttpGet]
		public async Task<BaseResponseModel<RoleDto>> GetRoleToEdit(Guid Id)
		{
			try
			{
				var result = await _serviceManager._roleService.GetByIdAsync(Id);
				return result;
			}
			catch (RoleNotFoundException ex)
			{
				return new BaseResponseModel<RoleDto>
				{
					Result = DefaultEnums.Result.error,
					Error = ex,
				};
			}
		}
		/// <summary>
		/// метод обновления существующей роли
		/// </summary>
		/// <param name="roleModel"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<BaseResponseModel<RoleDto>> UpdateThisRole(RoleDto roleModel)
		{
			try
			{
				var result = new BaseResponseModel<RoleDto>();
				if (roleModel != null)
				{
					result = await _serviceManager._roleService.UpdateAsync(roleModel);
				}
				return result;
			}
			catch (RoleNotFoundException ex)
			{
				return new BaseResponseModel<RoleDto>
				{
					Result = DefaultEnums.Result.error,
					Error = ex,
				};
			}
		}
		/// <summary>
		/// метод удаления роли
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<BaseResponseModel<RoleDto>> DeleteThisRole(Guid Id)
		{
			try
			{
				var delResult = await _serviceManager._roleService.DeleteRoleAsync(Id);
				if (delResult.Result == DefaultEnums.Result.ok)
				{
					return new BaseResponseModel<RoleDto>()
					{
						Result = DefaultEnums.Result.ok
					};
				}
				else
				{
					return new BaseResponseModel<RoleDto>()
					{
						Result = DefaultEnums.Result.error,
						Error = delResult.Error
					};
				}
			}
			catch (RoleNotFoundException ex)
			{
				return new BaseResponseModel<RoleDto>
				{
					Result = DefaultEnums.Result.error,
					Error = ex,
				};
			}
		}
		/// <summary>
		/// метод создание новой роли
		/// </summary>
		/// <param name="newRole"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<BaseResponseModel<RoleDto>> CreateNewRole(RoleDto newRole)
		{
			try
			{
				var result = await _serviceManager._roleService.CreateAsync(newRole);
				return result;
			}
			catch (Exception ex)
			{
				return new BaseResponseModel<RoleDto>
				{
					Result = DefaultEnums.Result.error,
					Error = ex,
				};
			}
		}

		[HttpPost]
		public async Task<BaseResponseModel<RoleDto>> MarkRoleAsRemoved(Guid thisId)
		{
			try
			{
				//Guid roleId = Guid.Empty;
				//Guid.TryParse(thisId, out roleId);
				var res = await _serviceManager._roleService.MarkRoleAsRemoved(thisId);
				return new BaseResponseModel<RoleDto>
				{
					Result = DefaultEnums.Result.ok,
					Entity = new RoleDto
					{
						isRemoved = res
					}
				};
			}
			catch (RoleNotFoundException ex)
			{
				return new BaseResponseModel<RoleDto>
				{
					Result = DefaultEnums.Result.error,
					Error = ex,
				};
			}
		}
	}
}
