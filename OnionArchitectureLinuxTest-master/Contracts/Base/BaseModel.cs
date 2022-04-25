using Contracts.CommonData;
using System;
using System.Text.Json.Serialization;

namespace Contracts.Base
{
    public class BaseModel
    {
        [JsonIgnore]
        public Exception Error { get; set; }
        public string ErrorInfo
        {
            get
            {
                if (Error != null)
                {
                    return Error.Message + (Error.InnerException != null ? ", " + Error.InnerException.Message : "");
                }
                else
                {
                    return "";
                }
            }
        }
        public DefaultEnums.Result Result { get; set; }
        public BaseModel()
        {
            Result = DefaultEnums.Result.ok;
        }
        public BaseModel(Exception exp)
        {
            Error = exp;
            Result = DefaultEnums.Result.error;
        }
        
    }

    public static class BaseModelUtilities<T>
        where T : BaseModel, new()
    {
        public static T DataFormat(T CurrentData)
        {
            CurrentData.Result = DefaultEnums.Result.ok;
            return CurrentData;
        }

        public static T ErrorFormat(Exception exp)
        {
            return new T() { Error = exp, Result = DefaultEnums.Result.error };
        }
    }
}
