using Models.CommonData;
using System;
using System.Collections.Generic;
using System.Text;

namespace Models.Base
{
    public class DataTableModel
    {
        /// <summary>
        /// Поиск
        /// </summary>
        public class DtSearch
        {
            public string value { get; set; }
            public bool regex { get; set; }
        }
        /// <summary>
        /// Порядок
        /// </summary>
        public class DtOrder
        {
            public string dir { get; set; }
            public int column { get; set; }
        }
        /// <summary>
        /// Колонка
        /// </summary>
        public class DtColumn
        {
            public string data { get; set; }
            public string name { get; set; }
            public bool searchable { get; set; }
            public bool orderable { get; set; }
            public DtSearch search { get; set; }
        }


        public class DtResponse<T>
        {
            public int recordsTotal { get; set; }
            public int recordsFiltered { get; set; }
            public IReadOnlyList<T> data { get; set; }
            public DefaultEnums.Result Result { get; set; }
            public string message { get; set; }

            public DtResponse()
            {
                this.Result = DefaultEnums.Result.ok;
                this.data = new List<T>();
            }

            public static DtResponse<T> Error(Exception Exp)
            {
                return new DtResponse<T>
                {
                    Result = DefaultEnums.Result.error,
                    message = Exp != null ? (Exp.Message + (Exp.InnerException != null ? ", " + Exp.InnerException.Message : "")) : ""
                };
            }

            public static DtResponse<T> Error(string Msg)
            {
                return new DtResponse<T>
                {
                    Result = DefaultEnums.Result.error,
                    message = Msg
                };
            }

        }
    }
}
