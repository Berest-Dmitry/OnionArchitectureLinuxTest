using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OnionArcitectureLinuxTest1
{
	public class Program
	{
		public static async Task Main(string[] args)
		{
			//CreateHostBuilder(args).Build().Run();
			var webHost = CreateHostBuilder(args).Build();
			await ApplyMigrations(webHost.Services);
			await webHost.RunAsync();
		}

		private static async Task ApplyMigrations(IServiceProvider serviceProvider)
		{
			using var scope = serviceProvider.CreateScope();

			await using ApplicationContext dbContext = scope.ServiceProvider.GetRequiredService<ApplicationContext>();

			await dbContext.Database.MigrateAsync();
		}

		public static IHostBuilder CreateHostBuilder(string[] args) =>
			Host.CreateDefaultBuilder(args)
				.ConfigureWebHostDefaults(webBuilder =>
				{
					webBuilder.UseStartup<Startup>();
					webBuilder.ConfigureLogging((ctx, logging) =>
					{
					});
				});
	}
}
