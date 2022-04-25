using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Persistence
{
	/// <summary>
	/// класс контекста БД
	/// </summary>
	public class ApplicationContext: DbContext
	{
		public ApplicationContext(DbContextOptions options) : base(options)
		{
			Database.Migrate();
			Database.EnsureCreated();
			//Database.EnsureCreated();
		}

		public DbSet<User> Users { get; set; }
		public DbSet<Role> Roles { get; set; }
		public DbSet<UserRoles> UserRoles { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationContext).Assembly);
		}
	}
}
