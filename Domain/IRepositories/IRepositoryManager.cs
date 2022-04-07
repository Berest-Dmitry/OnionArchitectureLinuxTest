using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.IRepositories
{
	public interface IRepositoryManager
	{
		IRoleRepository _roleRepository { get; }

		IUserRepository _userRepository { get; }

		IUserRolesRepository _userRolesRepository { get; }
	}
}
