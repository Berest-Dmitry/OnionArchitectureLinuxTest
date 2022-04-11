using System;
using AutoMapper;
using Contracts;
using Contracts.Models;
using Domain.Entities;

namespace Services {
	public static class ObjectMapper {
		private static readonly Lazy<IMapper> Lazy = new Lazy<IMapper>(() =>
		{
			var config = new MapperConfiguration(cfg =>
			{
				// This line ensures that internal properties are also mapped over.
				cfg.ShouldMapProperty = p => p.GetMethod.IsPublic || p.GetMethod.IsAssembly;
				cfg.AddProfile<AspnetRunDtoMapper>();
			});
			var mapper = config.CreateMapper();
			return mapper;
		});
		public static IMapper Mapper => Lazy.Value;
	}
	public class AspnetRunDtoMapper : Profile {
		public AspnetRunDtoMapper() {
			CreateMap<User, UserDto>()
				.ReverseMap();
			CreateMap<Role, RoleDto>()
				.ReverseMap();
			CreateMap<UserRoles, UserRolesDto>()
				.ReverseMap();
		}
	}
}