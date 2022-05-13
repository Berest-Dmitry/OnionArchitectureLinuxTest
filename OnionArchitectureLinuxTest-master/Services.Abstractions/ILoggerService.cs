using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Abstractions
{
    /// <summary>
    /// интерфейс сервиса базового логгирования сообщений
    /// </summary>
    public interface ILoggerService
    {
        public void WriteLogToFile(string message, string filePath, string fileName);
    }
}
