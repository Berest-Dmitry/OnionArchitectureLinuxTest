using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Persistence.Configurations
{
	/// <summary>
	/// класс конфигурации ролей
	/// </summary>
	internal sealed class RoleConfiguration: IEntityTypeConfiguration<Role>
	{
		public void Configure(EntityTypeBuilder<Role> typeBuilder)
		{
			typeBuilder.ToTable("roles");
			typeBuilder.HasKey(b => b.id);
			typeBuilder.Property(b => b.id)
				.ValueGeneratedOnAdd()
				.IsRequired();

			typeBuilder.Property(b => b.rolename)
				.IsRequired();
		}
	}
}
