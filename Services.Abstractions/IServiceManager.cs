using System;
using System.Collections.Generic;
using System.Text;

namespace Services.Abstractions
{
	public interface IServiceManager
	{
		IUserRoleService _userRoleService { get; }

		IUserService _userService { get; }

		IRoleService _roleService { get; }
	}
}
