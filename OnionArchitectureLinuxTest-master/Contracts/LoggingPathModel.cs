using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Contracts
{
    /// <summary>
    /// класс для конфигурации логгирования событий
    /// </summary>
    public class LoggingPathModel
    {
        public string FilePath { get; set; }

        public string FileName { get; set; }

        public string ErrorFileName { get; set; }

        public string OSName { get; set; }
    }
}
