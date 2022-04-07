using Domain.Entities.Base;
using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
	/// <summary>
	/// пользователь
	/// </summary>
	public class User : Entity
	{
		/// <summary>
		/// имя пользователя
		/// </summary>
		public string firstname { get; set; }
		/// <summary>
		/// фамилия пользователя
		/// </summary>
		public string lastname { get; set; }
		/// <summary>
		/// эл. почта
		/// </summary>
		public string email { get; set; }
		/// <summary>
		/// флаг - удален
		/// </summary>
		public bool is_removed { get; set; }

		public List<UserRoles> UserRoles { get; set; } = new List<UserRoles>();
	}
}
