using System.Collections.Generic;
using Domain.Entities.Base;

namespace Domain.Entities
{
	/// <summary>
	/// пользователь
	/// </summary>
	public class User : TrackedEntity
	{
		/// <summary>
		/// имя пользователя
		/// </summary>
		public string FirstName { get; set; }
		/// <summary>
		/// фамилия пользователя
		/// </summary>
		public string LastName { get; set; }
		/// <summary>
		/// эл. почта
		/// </summary>
		public string Email { get; set; }
		/// <summary>
		/// флаг - удален
		/// </summary>
		public bool IsRemoved { get; set; }

		public List<UserRoles> UserRoles { get; set; } = new List<UserRoles>();
	}
}
