using Domain.Entities.Base;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
	/// <summary>
	/// роль пользователя
	/// </summary>
	public class Role : Entity
	{
		/// <summary>
		/// название роли
		/// </summary>
		public string rolename { get; set; }
		/// <summary>
		/// флаг - роль удалена
		/// </summary>
		public bool is_removed { get; set; }

		public List<UserRoles> UserRoles { get; set; } = new List<UserRoles>();
	}
}
