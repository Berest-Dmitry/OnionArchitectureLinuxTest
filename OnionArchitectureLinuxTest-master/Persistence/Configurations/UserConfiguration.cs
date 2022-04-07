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
			typeBuilder.HasKey(b => b.Id);
			typeBuilder.Property(b => b.Id)
				.ValueGeneratedOnAdd()
				.IsRequired();

			typeBuilder.Property(b => b.FirstName)
				.IsRequired();

			typeBuilder.Property(b => b.LastName)
				.IsRequired();

			typeBuilder.Property(b => b.WhoChanged)
				.HasMaxLength(150);
		}
	}
}
