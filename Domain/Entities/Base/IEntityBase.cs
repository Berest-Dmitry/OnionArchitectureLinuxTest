using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities.Base
{
	public interface IEntityBase
	{
		public interface IEntityBase<TId>
		{
			TId id { get; }
		}
	}
}
