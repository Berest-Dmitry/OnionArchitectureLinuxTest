using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Text;

namespace Persistence.Configurations
{
	/// <summary>
	/// класс конфигурации пользователей
	/// </summary>
	internal sealed class UserConfiguration: IEntityTypeConfiguration<User>
	{
		public void Configure(EntityTypeBuilder<User> typeBuilder)
		{
			typeBuilder.ToTable("users");
			typeBuilder.HasKey(b => b.id);
			typeBuilder.Property(b => b.id)
				.ValueGeneratedOnAdd()
				.IsRequired();

			typeBuilder.Property(b => b.firstname)
				.IsRequired();

			typeBuilder.Property(b => b.lastname)
				.IsRequired();
		}
	}
}
