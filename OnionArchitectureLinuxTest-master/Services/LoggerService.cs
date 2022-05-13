using Services.Abstractions;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services
{
    /// <summary>
    /// сервис базового логгирования сообщений
    /// </summary>
    public class LoggerService : ILoggerService
    {
        public void WriteLogToFile(string message, string filePath, string fileName)
        {
            try
            {
                bool exists = File.Exists(filePath);
                if (exists) File.Delete(filePath + fileName);
                using (var streamWriter = new StreamWriter(Path.Combine(filePath, fileName),
                    new FileStreamOptions { Mode = FileMode.CreateNew, Access = FileAccess.Write }))
                {
                    streamWriter.WriteLine(message);
                    streamWriter.Close();
                    streamWriter.Dispose();
                }
            }
            catch (Exception ex)
            {

            }
        }
    }
}
