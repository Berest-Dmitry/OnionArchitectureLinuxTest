using Contracts.Base;
using Contracts.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Services.Abstractions
{
	/// <summary>
	/// интерфейс ролей
	/// </summary>
	public interface IRoleService
	{
		Task<DataTableModel.DtResponse<RoleModel>> GetAllRolesAsync(string search = null);

		Task<RoleModel> GetByIdAsync(Guid Id);

		Task<RoleModel> CreateAsync(RoleModel roleModel);

		Task<RoleModel> UpdateAsync(RoleModel roleModel);

		Task<RoleModel> DeleteRoleAsync(Guid roleId);

		Task<bool> MarkRoleAsRemoved(Guid roleId);
	}
}
