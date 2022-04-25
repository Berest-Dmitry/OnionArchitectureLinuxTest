using Contracts.Base;
using Contracts.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Services.Abstractions.Database
{
	/// <summary>
	/// интерфейс ролей
	/// </summary>
	public interface IRoleService
	{
		Task<DataTableModel.DtResponse<RoleDto>> GetAllRolesAsync(string search = null);

		Task<BaseResponseModel<RoleDto>> GetByIdAsync(Guid Id);

		Task<BaseResponseModel<RoleDto>> CreateAsync(RoleDto roleModel);

		Task<BaseResponseModel<RoleDto>> UpdateAsync(RoleDto roleModel);

		Task<BaseResponseModel<RoleDto>> DeleteRoleAsync(Guid roleId);

		Task<bool> MarkRoleAsRemoved(Guid roleId);
	}
}
