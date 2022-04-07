using Models.Base;
using System;
using System.Collections.Generic;
using System.Text;

namespace Models
{
	/// <summary>
	/// модель данных о пользователе
	/// </summary>
	public class UserModel: BaseModel
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
	}
}
