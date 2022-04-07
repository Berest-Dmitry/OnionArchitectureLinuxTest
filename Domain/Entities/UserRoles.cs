using Domain.Entities.Base;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
	/// <summary>
	/// роль пользователя
	/// </summary>
	public class UserRoles : Entity
	{
		/// <summary>
		/// ID пользователя
		/// </summary>
		public Guid userid { get; set; }
		public User User { get; set; }
		/// <summary>
		/// ID роли
		/// </summary>
		public Guid roleid { get; set; }
		public Role Role { get; set; }
	}
}
