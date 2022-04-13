using System;
using System.Collections.Generic;
using System.Text;

namespace Contracts.Base
{
	public class BaseResponseModel<T>: BaseModel 
		where T:class
	{
		public BaseResponseModel():base()
		{

		}
		public BaseResponseModel(T Entity) : base()
		{
			this.Entity = Entity;
		}
		public BaseResponseModel(Exception exp,T Entity=null):base(exp)
		{
			this.Entity = Entity;
		}
		
		public T Entity { get; set; }
	}
}
