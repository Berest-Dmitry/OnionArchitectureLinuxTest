using Models.Base;
using System;
using System.Collections.Generic;
using System.Text;

namespace Models
{
	/// <summary>
	/// модель данных о связи пользователя и роли
	/// </summary>
	public class UserRolesModel: BaseModel
	{
		/// <summary>
		/// ID пользователя
		/// </summary>
		public Guid UserId { get; set; }
		/// <summary>
		/// ID роли
		/// </summary>
		public Guid RoleId { get; set; }
	}
}
