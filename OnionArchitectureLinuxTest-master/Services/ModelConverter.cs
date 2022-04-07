using Domain.Entities;
using Contracts;
using Contracts.Models;

namespace Services
{
	public sealed class ModelConverter
	{
		#region ModelToViewModel
		public static UserModel UserModelToViewModel(User obj)
		{
			return new UserModel
			{
				id = obj.Id,
				firstName = obj.FirstName,
				lastName = obj.LastName,
				email = obj.Email,
				isRemoved = obj.IsRemoved
			};
		}

		public static RoleModel RoleModelToViewModel(Role obj)
		{
			return new RoleModel
			{
				id = obj.Id,
				roleName = obj.RoleName,
				isRemoved = obj.IsRemoved
			};
		}

		public static UserRolesModel UserRolesModelToViewModel(UserRoles obj)
		{
			return new UserRolesModel
			{
				id = obj.Id,
				UserId = obj.UserId,
				RoleId = obj.RoleId
			};
		}
		#endregion

		#region ViewModelToModel

		public static User UserViewModelToModel(UserModel mod)
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

		public static Role RoleViewModelToModel(RoleModel mod)
		{
			return new Role
			{
				Id = mod.id,
				RoleName = mod.roleName,
				IsRemoved = mod.isRemoved
			};
		}

		public static UserRoles UserRolesViewModelToModel(UserRolesModel mod)
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
