using Domain.Entities.Base;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace Domain.IRepositories.Base
{
    public interface IRepository<T> where T : Entity
    {
        /// <summary>
        /// 
        /// </summary>
        Task<IReadOnlyList<T>> GetAllAsync();
        /// <summary>
        /// 
        /// </summary>
        /// <param name="predicate"></param>
        Task<IReadOnlyList<T>> GetAsync(Expression<Func<T, bool>> predicate);
        /// <summary>
        /// 
        /// </summary>
        /// <param name="id"></param>
        Task<T> GetByIdAsync(Guid id);
        /// <summary>
        /// 
        /// </summary>
        /// <param name="entity"></param>
        Task<T> AddAsync(T entity);
        /// <summary>
        /// 
        /// </summary>
        /// <param name="entity"></param>
        Task UpdateAsync(T entity);
        /// <summary>
        /// 
        /// </summary>
        /// <param name="entity"></param>
        Task DeleteAsync(T entity);


    }
}
