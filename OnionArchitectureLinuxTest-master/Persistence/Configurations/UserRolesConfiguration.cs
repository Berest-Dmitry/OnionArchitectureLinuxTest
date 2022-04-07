using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Persistence.Configurations
{
	/// <summary>
	/// класс конфигурации связи пользователей с ролями
	/// </summary>
	internal sealed class UserRolesConfiguration: IEntityTypeConfiguration<UserRoles>
	{
		public void Configure(EntityTypeBuilder<UserRoles> typeBuilder)
		{
			typeBuilder.ToTable("user_roles");
			typeBuilder.HasKey(b => b.Id);
			typeBuilder.Property(b => b.Id)
				.ValueGeneratedOnAdd()
				.IsRequired();

			typeBuilder.Property(b => b.RoleId)
				.IsRequired();

			typeBuilder.Property(b => b.UserId)
				.IsRequired();

			typeBuilder.HasOne<User>(b => b.User)
				.WithMany(u => u.UserRoles)
				.HasForeignKey(b => b.UserId)
				.OnDelete(DeleteBehavior.Cascade);

			typeBuilder.HasOne<Role>(b => b.Role)
				.WithMany(r => r.UserRoles)
				.HasForeignKey(b => b.RoleId)
				.OnDelete(DeleteBehavior.Cascade);
		}
	}
}
