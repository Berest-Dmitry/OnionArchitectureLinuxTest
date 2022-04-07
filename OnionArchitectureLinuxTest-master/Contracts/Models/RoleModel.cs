using Contracts.Base;
using System;
using System.Collections.Generic;
using System.Text;

namespace Contracts.Models
{
	/// <summary>
	/// модель данных о роли
	/// </summary>
	public class RoleModel: BaseTrackedModel
	{
		/// <summary>
		/// название роли
		/// </summary>
		public string roleName { get; set; }
		/// <summary>
		/// флаг - роль удалена
		/// </summary>
		public bool isRemoved { get; set; }
	}
}
