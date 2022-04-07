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
		Task<DataTableModel.DtResponse<UserModel>> GetAllUsersAsync(string search = null);

		Task<UserModel> GetByIdAsync(Guid Id);

		Task<UserModel> CreateAsync(UserModel userModel);

		Task<UserModel> UpdateAsync(UserModel userModel);

		Task<UserModel> DeleteUserAsync(Guid userId);

		Task<bool> MarkUserAsRemoved( Guid userId);
	}
}
