using Domain.IRepositories;
using Services.Abstractions;
using Services.Abstractions.Database;
using Services.Database;
using System;
using System.Collections.Generic;
using System.Text;

namespace Services
{
	public sealed class ServiceManager : IServiceManager
	{
		private readonly Lazy<IUserService> _lazyUserService;
		private readonly Lazy<IRoleService> _lazyRoleService;
		private readonly Lazy<IUserRoleService> _lazyUserRoleService;

		public ServiceManager(IRepositoryManager repositoryManager)
		{
			_lazyUserService = new Lazy<IUserService>(() => new UserService(repositoryManager));
			_lazyRoleService = new Lazy<IRoleService>(() => new RoleService(repositoryManager));
			_lazyUserRoleService = new Lazy<IUserRoleService>(() => new UserRoleService(repositoryManager));
		}

		public IUserService _userService => _lazyUserService.Value;
		public IRoleService _roleService => _lazyRoleService.Value;
		public IUserRoleService _userRoleService => _lazyUserRoleService.Value;
	}
}
