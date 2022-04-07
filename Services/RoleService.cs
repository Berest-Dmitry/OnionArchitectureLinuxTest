using Domain.Entities;
using Domain.IRepositories;
using Models;
using Models.Base;
using Services.Abstractions;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Services
{
	public class RoleService: IRoleService
	{
		private readonly IRepositoryManager _repositoryManager;

		public RoleService(IRepositoryManager repositoryManager)
		{
			_repositoryManager = repositoryManager ?? throw new ArgumentNullException(nameof(repositoryManager));
		}

		/// <summary>
		/// метод создания записи о роли
		/// </summary>
		/// <param name="roleModel"></param>
		/// <returns></returns>
		public async  Task<RoleModel> CreateAsync(RoleModel roleModel)
		{
			try
			{
				var entity = ModelConverter.RoleViewModelToModel(roleModel);
				entity.id = Guid.NewGuid();
				var res = await _repositoryManager._roleRepository.AddAsync(entity);
				return ModelConverter.RoleModelToViewModel(res);
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<RoleModel>.ErrorFormat(ex);
			}
		}

		/// <summary>
		/// метод удаления записи о роли
		/// </summary>
		/// <param name="roleId"></param>
		/// <returns></returns>
		public async Task<RoleModel> DeleteRoleAsync(Guid roleId)
		{
			try
			{
				var existing_entity = await _repositoryManager._roleRepository.GetByIdAsync(roleId);
				if(existing_entity != null)
				{
					await _repositoryManager._roleRepository.DeleteAsync(existing_entity);
					return new RoleModel
					{
						Result = Models.CommonData.DefaultEnums.Result.ok
					};
				}
				else
				{
					return new RoleModel
					{
						Result = Models.CommonData.DefaultEnums.Result.error,
						Error = new Exception("Произошла ошибка при удалении данного роли! ")
					};
				}
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<RoleModel>.ErrorFormat(ex);
			}
		}

		/// <summary>
		/// метод получения таблицы ролей
		/// </summary>
		/// <param name="search"></param>
		/// <returns></returns>
		public async Task<DataTableModel.DtResponse<RoleModel>> GetAllRolesAsync(string search = null)
		{
			try
			{
				var roleList = new List<Role>();
				var result = new List<RoleModel>();
				if (string.IsNullOrEmpty(search))
				{
					roleList = await _repositoryManager._roleRepository.GetAllAsync() as List<Role>;
				}
				else
				{
					roleList = await _repositoryManager._roleRepository.GetRolesBySearch(search);
				}
				if(roleList != null)
				{
					foreach (var item in roleList)
						result.Add(ModelConverter.RoleModelToViewModel(item));
				}
				return new DataTableModel.DtResponse<RoleModel> { 
					data = result,
					recordsTotal = result.Count,
					recordsFiltered = result.Count
				};
			}
			catch (Exception ex)
			{
				return new DataTableModel.DtResponse<RoleModel>()
				{
					Result = Models.CommonData.DefaultEnums.Result.error,
					message = ex.Message
				};
			}
		}

		/// <summary>
		/// Поиск роли по ее ID
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		public async Task<RoleModel> GetByIdAsync(Guid Id)
		{
			try
			{
				var entity = await _repositoryManager._roleRepository.GetByIdAsync(Id);
				if(entity != null)
				{
					return ModelConverter.RoleModelToViewModel(entity);
				}
				else return new RoleModel() { Error = new Exception("Роль не найдена!") };

			}
			catch (Exception ex)
			{
				return BaseModelUtilities<RoleModel>.ErrorFormat(ex);
			}
		}

		/// <summary>
		/// обновление записи о роли
		/// </summary>
		/// <param name="roleModel"></param>
		/// <returns></returns>
		public async Task<RoleModel> UpdateAsync(RoleModel roleModel)
		{
			try
			{
				var existing_entity = await _repositoryManager._roleRepository.GetByIdAsync(roleModel.id);
				if(existing_entity != null)
				{
					existing_entity.rolename = roleModel.rolename;
					await _repositoryManager._roleRepository.UpdateAsync(existing_entity);
					return roleModel;
				}
				else
				{
					return new RoleModel();
				}
			}
			catch (Exception ex)
			{
				return BaseModelUtilities<RoleModel>.ErrorFormat(ex);
			}
		}

		/// <summary>
		/// метод пометки роли (не)удаленной
		/// </summary>
		/// <param name="roleId"></param>
		/// <returns></returns>
		public async Task<bool> MarkRoleAsRemoved(Guid roleId)
		{
			try
			{
				var existing_entity = await _repositoryManager._roleRepository.GetByIdAsync(roleId);
				if(existing_entity != null)
				{
					existing_entity.is_removed = !existing_entity.is_removed;
					await _repositoryManager._roleRepository.UpdateAsync(existing_entity);
					return true;
				}
				return false;
			}
			catch(Exception ex)
			{
				return false;
			}
		}
	}
}
