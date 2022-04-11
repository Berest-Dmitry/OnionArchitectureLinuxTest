using Contracts;
using Contracts.Base;
using Contracts.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Services.Abstractions
{
	/// <summary>
	/// интерфейс пользователей
	/// </summary>
	public interface IUserService
	{
		Task<DataTableModel.DtResponse<UserDto>> GetAllUsersAsync(string search = null);

		Task<UserDto> GetByIdAsync(Guid Id);

		Task<UserDto> CreateAsync(UserDto userModel);

		Task<UserDto> UpdateAsync(UserDto userModel);

		Task<UserDto> DeleteUserAsync(Guid userId);

		Task<bool> MarkUserAsRemoved( Guid userId);
	}
}
