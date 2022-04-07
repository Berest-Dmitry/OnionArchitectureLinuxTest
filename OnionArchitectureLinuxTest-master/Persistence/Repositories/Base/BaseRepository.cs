using Domain.Entities.Base;
using Domain.IRepositories.Base;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Persistence.Repositories.Base
{
	/// <summary>
	/// базовый репозиторий
	/// </summary>
	/// <typeparam name="T"></typeparam>
	public class BaseRepository<T> : IRepository<T> where T : Entity
	{
		protected readonly ApplicationContext dbContext;
		
		public BaseRepository(ApplicationContext context)
		{
			dbContext = context ?? throw new ArgumentNullException(nameof(context));
		}

		public async Task<IReadOnlyList<T>> GetAllAsync()
		{
			return await dbContext.Set<T>().ToListAsync();
		}

		public async Task<IReadOnlyList<T>> GetAsync(Expression<Func<T, bool>> predicate)
		{
			return await dbContext.Set<T>().Where(predicate).ToListAsync();
		}

		public virtual async Task<T> GetByIdAsync(Guid id)
		{
			return await dbContext.Set<T>().FindAsync(id);
		}

		public async Task<T> AddAsync(T entity)
		{
			try
			{
				dbContext.Set<T>().Add(entity);
				await dbContext.SaveChangesAsync();
				return entity;
			}
			catch (Exception exp)
			{
				throw exp;
			}
		}

		public async Task UpdateAsync(T entity)
		{
			dbContext.Entry(entity).State = EntityState.Modified;
			await dbContext.SaveChangesAsync();
		}

		public virtual async Task DeleteAsync(T entity)
		{
			dbContext.Set<T>().Remove(entity);
			await dbContext.SaveChangesAsync();
		}
	}
}
