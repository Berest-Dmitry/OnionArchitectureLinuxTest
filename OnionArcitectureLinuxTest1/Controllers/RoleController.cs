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
	public class RoleController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}

		public ActionResult Roles()
		{
			return View("Roles");
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
				return new DataTableModel.DtResponse<RoleModel>();
			}
		}
		/// <summary>
		/// метод получения записи о роли для редактирования
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		[HttpGet]
		public async Task<RoleModel> GetRoleToEdit(Guid Id)
		{
			try
			{
				var result = await _serviceManager._roleService.GetByIdAsync(Id);
				return result;
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<RoleModel>.ErrorFormat(ex);
			}
		}
		/// <summary>
		/// метод обновления существующей роли
		/// </summary>
		/// <param name="roleModel"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<RoleModel> UpdateThisRole(RoleModel roleModel)
		{
			try
			{
				var result = new RoleModel();
				if (roleModel != null)
				{
					result = await _serviceManager._roleService.UpdateAsync(roleModel);
				}
				return result;
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<RoleModel>.ErrorFormat(ex);
			}
		}
		/// <summary>
		/// метод удаления роли
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<RoleModel> DeleteThisRole(Guid Id)
		{
			try
			{
				var delResult = await _serviceManager._roleService.DeleteRoleAsync(Id);
				if (delResult.Result == DefaultEnums.Result.ok)
				{
					return new RoleModel()
					{
						Result = DefaultEnums.Result.ok
					};
				}
				else
				{
					return new RoleModel()
					{
						Result = DefaultEnums.Result.error,
						Error = delResult.Error
					};
				}
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<RoleModel>.ErrorFormat(ex);
			}
		}
		/// <summary>
		/// метод создание новой роли
		/// </summary>
		/// <param name="newRole"></param>
		/// <returns></returns>
		[HttpPost]
		public async Task<RoleModel> CreateNewRole(RoleModel newRole)
		{
			try
			{
				var result = await _serviceManager._roleService.CreateAsync(newRole);
				return result;
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<RoleModel>.ErrorFormat(ex);
			}
		}

		[HttpPost]
		public async Task<RoleModel> MarkRoleAsRemoved(string thisId)
		{
			try
			{
				Guid roleId = Guid.Empty;
				Guid.TryParse(thisId, out roleId);
				var res = await _serviceManager._roleService.MarkRoleAsRemoved(roleId);
				return new RoleModel
				{
					Result = DefaultEnums.Result.ok,
					is_removed = res
				};
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<RoleModel>.ErrorFormat(ex);
			}
		}
	}
}
