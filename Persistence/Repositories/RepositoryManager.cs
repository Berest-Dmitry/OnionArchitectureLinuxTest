using Domain.IRepositories;
using System;
using System.Collections.Generic;
using System.Text;

namespace Persistence.Repositories
{
	public sealed class RepositoryManager: IRepositoryManager
	{
		private readonly Lazy<IUserRepository> _lazyUserRepository;
		private readonly Lazy<IRoleRepository> _lazyRoleRepository;
		private readonly Lazy<IUserRolesRepository> _lazyUserRolesRepository;

		public RepositoryManager(ApplicationContext context)
		{
			_lazyUserRepository = new Lazy<IUserRepository>(() => new UserRepository(context));
			_lazyRoleRepository = new Lazy<IRoleRepository>(() => new RoleRepository(context));
			_lazyUserRolesRepository = new Lazy<IUserRolesRepository>(() => new UserRoleRepository(context));

		}

		public IUserRepository _userRepository => _lazyUserRepository.Value;

		public IRoleRepository _roleRepository => _lazyRoleRepository.Value;

		public IUserRolesRepository _userRolesRepository => _lazyUserRolesRepository.Value;
	}
}
