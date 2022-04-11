using Contracts.Base;
using System;
using System.Collections.Generic;
using System.Text;

namespace Contracts.Models
{
	/// <summary>
	/// модель данных о пользователе
	/// </summary>
	public class UserDto: BaseTrackedModel
	{
		/// <summary>
		/// имя пользователя
		/// </summary>
		public string firstName { get; set; }
		/// <summary>
		/// фамилия пользователя
		/// </summary>
		public string lastName { get; set; }
		/// <summary>
		/// эл. почта
		/// </summary>
		public string email { get; set; }
		/// <summary>
		/// флаг - удален
		/// </summary>
		public bool isRemoved { get; set; }
	}
}
