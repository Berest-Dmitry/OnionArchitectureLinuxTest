using Models.Base;
using System;
using System.Collections.Generic;
using System.Text;

namespace Models
{
	/// <summary>
	/// модель данных о роли
	/// </summary>
	public class RoleModel: BaseModel
	{
		/// <summary>
		/// название роли
		/// </summary>
		public string rolename { get; set; }
		/// <summary>
		/// флаг - роль удалена
		/// </summary>
		public bool is_removed { get; set; }
	}
}
