using Domain.IRepositories;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Persistence;
using Persistence.Repositories;
using Presentation.Controllers;
using Services;
using Services.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace OnionArcitectureLinuxTest1
{
	public class Startup
	{
		public Startup(IConfiguration configuration)
		{
			Configuration = configuration;
		}

		public IConfiguration Configuration { get; }

		// This method gets called by the runtime. Use this method to add services to the container.
		public void ConfigureServices(IServiceCollection services)
		{
			
			services.AddRazorPages();
			services.Configure<RazorPagesOptions>
				(options => options.RootDirectory = @"/Views");
			//services.AddRazorPages().WithRazorPagesRoot("/Views");

			#region Mapping
			services.AddScoped<IServiceManager, ServiceManager>();
			services.AddScoped<IRepositoryManager, RepositoryManager>();
			#endregion

			#region DatabaseConnection
			services.AddDbContextPool<ApplicationContext>(builder => {
				var connectionString = Configuration.GetConnectionString("Database");
				builder.UseNpgsql(connectionString, b => b.MigrationsAssembly("Persistence"))
				.UseSnakeCaseNamingConvention();
			});
			#endregion

			#region AddControllers

			services.AddControllersWithViews();
			services.AddControllers().AddApplicationPart(typeof(Presentation.AssemblyReference).Assembly);
			//ƒобавление контроллеров из другого проекта.
			services.AddMvc().AddApplicationPart(typeof(UserController).GetTypeInfo().Assembly);
			services.AddMvc().AddApplicationPart(typeof(RoleController).GetTypeInfo().Assembly);
			services.AddMvc().AddApplicationPart(typeof(UserRolesController).GetTypeInfo().Assembly);
			//	.ConfigureApiBehaviorOptions(options =>
			//{
			//	options.SuppressConsumesConstraintForFormFileParameters = true;
			//	options.SuppressInferBindingSourcesForParameters = true;
			//	options.SuppressModelStateInvalidFilter = true;
			//	options.SuppressMapClientErrors = true;
			//	options.ClientErrorMapping[StatusCodes.Status404NotFound].Link =
			//		"https://httpstatuses.com/404";
			//});
			services.AddAutoMapper(typeof(Startup));

			services.AddMvc()
				.AddFeatureFolders().AddJsonOptions(options =>
				{
					options.JsonSerializerOptions.PropertyNamingPolicy = null;
					options.JsonSerializerOptions.DictionaryKeyPolicy = null;
					options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
					//ons.JsonSerializerOptions.Converters.Add(new FloatConverter());
					//options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
				});
			#endregion
		}

		// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
		{
			if (env.IsDevelopment())
			{
				app.UseDeveloperExceptionPage();
			}
			else
			{
				app.UseExceptionHandler("/Error");
				// The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
				app.UseHsts();
			}

			app.UseHttpsRedirection();
			app.UseStaticFiles();

			app.UseRouting();

			app.UseAuthorization();

			#region MapControllers
			app.UseEndpoints(endpoints =>
			{
				endpoints.MapRazorPages();
				endpoints.MapControllers();

				endpoints.MapControllerRoute(
					name: "default",
					pattern: "{controller=Home}/{action=Index}/{id?}");
			});
			#endregion
		}
	}
}