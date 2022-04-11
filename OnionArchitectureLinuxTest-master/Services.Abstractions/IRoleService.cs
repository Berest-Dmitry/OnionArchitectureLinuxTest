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
		Task<DataTableModel.DtResponse<RoleDto>> GetAllRolesAsync(string search = null);

		Task<RoleDto> GetByIdAsync(Guid Id);

		Task<RoleDto> CreateAsync(RoleDto roleModel);

		Task<RoleDto> UpdateAsync(RoleDto roleModel);

		Task<RoleDto> DeleteRoleAsync(Guid roleId);

		Task<bool> MarkRoleAsRemoved(Guid roleId);
	}
}
