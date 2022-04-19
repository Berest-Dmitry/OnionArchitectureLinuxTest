using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Server.Kestrel.Core;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Runtime.InteropServices;
using System.Security.Cryptography.X509Certificates;
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
					var webProtocolSettings = new List<WebProtocolSettings>();
					webBuilder.UseStartup<Startup>();

                    if(RuntimeInformation.IsOSPlatform(OSPlatform.Linux)) webBuilder.UseKestrel(options => options.ConfigureEndpoints());
					webBuilder.ConfigureLogging((ctx, logging) =>
					{
						var sect = ctx.Configuration.GetSection("WebProtocolSettings");
						webProtocolSettings.AddRange(sect.GetChildren().Select(ch => new WebProtocolSettings
						{
							Url = ch["Url"],
							Port = ch["Port"]
						}));
						var url_from = "http://" + webProtocolSettings[0].Url + ":" + webProtocolSettings[0].Port;
						var url_to = "https://" + webProtocolSettings[1].Url + ":" + webProtocolSettings[1].Port;
						webBuilder.UseUrls(url_from, url_to);
					});				
				});
	}

    public static class KestrelServerOptionsExtensions
    {
        public static void ConfigureEndpoints(this KestrelServerOptions options)
        {
            var configuration = options.ApplicationServices.GetRequiredService<IConfiguration>();
            var environment = options.ApplicationServices.GetRequiredService<Microsoft.AspNetCore.Hosting.IHostingEnvironment>();

            var endpoints = configuration.GetSection("HttpServer:Endpoints")
                .GetChildren()
                .ToDictionary(section => section.Key, section =>
                {
                    var endpoint = new EndpointConfiguration();
                    section.Bind(endpoint);
                    return endpoint;
                });

            foreach (var endpoint in endpoints)
            {
                var config = endpoint.Value;
                var port = config.Port ?? (config.Scheme == "https" ? 7250 : 5003);

                var ipAddresses = new List<IPAddress>();
                if (config.Host == "localhost")
                {
                    ipAddresses.Add(IPAddress.IPv6Loopback);
                    ipAddresses.Add(IPAddress.Loopback);
                }
                else if (IPAddress.TryParse(config.Host, out var address))
                {
                    ipAddresses.Add(address);
                }
                else
                {
                    ipAddresses.Add(IPAddress.IPv6Any);
                }

                foreach (var address in ipAddresses)
                {
                    options.Listen(address, port,
                        listenOptions =>
                        {
                            if (config.Scheme == "https")
                            {
                                var certificate = LoadCertificate(config, environment);
                                listenOptions.UseHttps(certificate);
                            }
                        });
                }
            }
        }

        private static X509Certificate2 LoadCertificate(EndpointConfiguration config, Microsoft.AspNetCore.Hosting.IHostingEnvironment environment)
        {
            if (config.StoreName != null && config.StoreLocation != null)
            {
                using (var store = new X509Store(config.StoreName, Enum.Parse<StoreLocation>(config.StoreLocation)))
                {
                    store.Open(OpenFlags.ReadOnly);
                    var certificate = store.Certificates.Find(
                        X509FindType.FindBySubjectName,
                        config.Host,
                        validOnly: !environment.IsDevelopment());

                    if (certificate.Count == 0)
                    {
                        throw new InvalidOperationException($"Certificate not found for {config.Host}.");
                    }

                    return certificate[0];
                }
            }

            if (config.FilePath != null && config.Password != null)
            {
                return new X509Certificate2(config.FilePath, config.Password);
            }

            throw new InvalidOperationException("No valid certificate configuration found for the current endpoint.");
        }
    }
}
