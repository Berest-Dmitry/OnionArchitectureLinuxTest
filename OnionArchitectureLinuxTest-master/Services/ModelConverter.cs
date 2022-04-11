using Domain.Entities;
using Contracts;
using Contracts.Models;

namespace Services
{
	public sealed class ModelConverter
	{
		#region ModelToViewModel
		public static UserDto UserModelToViewModel(User obj)
		{
			return new UserDto
			{
				id = obj.Id,
				firstName = obj.FirstName,
				lastName = obj.LastName,
				email = obj.Email,
				isRemoved = obj.IsRemoved
			};
		}

		public static RoleDto RoleModelToViewModel(Role obj)
		{
			return new RoleDto
			{
				id = obj.Id,
				roleName = obj.RoleName,
				isRemoved = obj.IsRemoved
			};
		}

		public static UserRolesDto UserRolesModelToViewModel(UserRoles obj)
		{
			return new UserRolesDto
			{
				id = obj.Id,
				UserId = obj.UserId,
				RoleId = obj.RoleId
			};
		}
		#endregion

		#region ViewModelToModel

		public static User UserViewModelToModel(UserDto mod)
		{
			return new User
			{
				Id = mod.id,
				FirstName = mod.firstName,
				LastName = mod.lastName,
				Email = mod.email,
				IsRemoved = mod.isRemoved
			};
		}

		public static Role RoleViewModelToModel(RoleDto mod)
		{
			return new Role
			{
				Id = mod.id,
				RoleName = mod.roleName,
				IsRemoved = mod.isRemoved
			};
		}

		public static UserRoles UserRolesViewModelToModel(UserRolesDto mod)
		{
			return new UserRoles
			{
				Id = mod.id,
				UserId = mod.UserId,
				RoleId = mod.RoleId
			};
		}
		#endregion
	}
}
