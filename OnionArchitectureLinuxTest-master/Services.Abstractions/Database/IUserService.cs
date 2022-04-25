using Contracts;
using Contracts.Base;
using Contracts.Models;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace Services.Abstractions.Database
{
	/// <summary>
	/// интерфейс пользователей
	/// </summary>
	public interface IUserService
	{
		Task<DataTableModel.DtResponse<UserDto>> GetAllUsersAsync(string search = null);

		Task<BaseResponseModel<UserDto>> GetByIdAsync(Guid Id);

		Task<BaseResponseModel<UserDto>> CreateAsync(UserDto userModel);

		Task<BaseResponseModel<UserDto>> UpdateAsync(UserDto userModel);

		Task<BaseResponseModel<UserDto>> DeleteUserAsync(Guid userId);

		Task<bool> MarkUserAsRemoved( Guid userId);
	}
}
