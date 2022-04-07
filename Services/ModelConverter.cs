using Domain.Entities;
using Models;

namespace Services
{
	public sealed class ModelConverter
	{
		#region ModelToViewModel
		public static UserModel UserModelToViewModel(User obj)
		{
			return new UserModel
			{
				id = obj.id,
				firstname = obj.firstname,
				lastname = obj.lastname,
				email = obj.email,
				is_removed = obj.is_removed
			};
		}

		public static RoleModel RoleModelToViewModel(Role obj)
		{
			return new RoleModel
			{
				id = obj.id,
				rolename = obj.rolename,
				is_removed = obj.is_removed
			};
		}

		public static UserRolesModel UserRolesModelToViewModel(UserRoles obj)
		{
			return new UserRolesModel
			{
				id = obj.id,
				UserId = obj.userid,
				RoleId = obj.roleid
			};
		}
		#endregion

		#region ViewModelToModel

		public static User UserViewModelToModel(UserModel mod)
		{
			return new User
			{
				id = mod.id,
				firstname = mod.firstname,
				lastname = mod.lastname,
				email = mod.email,
				is_removed = mod.is_removed
			};
		}

		public static Role RoleViewModelToModel(RoleModel mod)
		{
			return new Role
			{
				id = mod.id,
				rolename = mod.rolename,
				is_removed = mod.is_removed
			};
		}

		public static UserRoles UserRolesViewModelToModel(UserRolesModel mod)
		{
			return new UserRoles
			{
				id = mod.id,
				userid = mod.UserId,
				roleid = mod.RoleId
			};
		}
		#endregion
	}
}
