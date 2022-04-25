using Domain.Entities;
using Domain.IRepositories;
using Contracts.Base;
using Services.Abstractions;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Contracts.CommonData;
using Contracts.Models;
using Services.Abstractions.Database;

namespace Services.Database
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
		public async  Task<BaseResponseModel<RoleDto>> CreateAsync(RoleDto roleModel)
		{
			try
			{
				//var entity = ModelConverter.RoleViewModelToModel(roleModel);
				var entity = ObjectMapper.Mapper.Map<Role>(roleModel);
				entity.Id = Guid.NewGuid();
				var res = await _repositoryManager._roleRepository.AddAsync(entity);
				//return ModelConverter.RoleModelToViewModel(res);
				var createdModel = ObjectMapper.Mapper.Map<RoleDto>(res);
				return new BaseResponseModel<RoleDto>
				{
					Result = DefaultEnums.Result.ok,
					Entity = createdModel
				};
			}
			catch (Exception ex)
			{
				//return BaseModelUtilities<RoleDto>.ErrorFormat(ex);
				return new BaseResponseModel<RoleDto>
				{
					Result = DefaultEnums.Result.error,
					Error = ex,
				};
			}
		}

		/// <summary>
		/// метод удаления записи о роли
		/// </summary>
		/// <param name="roleId"></param>
		/// <returns></returns>
		public async Task<BaseResponseModel<RoleDto>> DeleteRoleAsync(Guid roleId)
		{
			try
			{
				var existing_entity = await _repositoryManager._roleRepository.GetByIdAsync(roleId);
				if(existing_entity != null)
				{
					await _repositoryManager._roleRepository.DeleteAsync(existing_entity);
					return new BaseResponseModel< RoleDto >
					{
						Result = DefaultEnums.Result.ok
					};
				}
				else
				{
					return new BaseResponseModel < RoleDto >
					{
						Result = DefaultEnums.Result.error,
						Error = new Exception("Произошла ошибка при удалении данного роли! ")
					};
				}
			}
			catch (Exception ex)
			{
				//return BaseModelUtilities<RoleDto>.ErrorFormat(ex);
				return new BaseResponseModel<RoleDto>
				{
					Result = DefaultEnums.Result.error,
					Error = ex,
				};
			}
		}

		/// <summary>
		/// метод получения таблицы ролей
		/// </summary>
		/// <param name="search"></param>
		/// <returns></returns>
		public async Task<DataTableModel.DtResponse<RoleDto>> GetAllRolesAsync(string search = null)
		{
			try
			{
				var roleList = new List<Role>();
				var result = new List<RoleDto>();
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
						result.Add(ObjectMapper.Mapper.Map<RoleDto>(item));
				}
				return new DataTableModel.DtResponse<RoleDto> { 
					data = result,
					recordsTotal = result.Count,
					recordsFiltered = result.Count
				};
			}
			catch (Exception ex)
			{
				return new DataTableModel.DtResponse<RoleDto>()
				{
					Result = DefaultEnums.Result.error,
					message = ex.Message
				};
			}
		}

		/// <summary>
		/// Поиск роли по ее ID
		/// </summary>
		/// <param name="Id"></param>
		/// <returns></returns>
		public async Task<BaseResponseModel<RoleDto>> GetByIdAsync(Guid Id)
		{
			try
			{
				var entity = await _repositoryManager._roleRepository.GetByIdAsync(Id);
				if(entity != null)
				{
					//return ModelConverter.RoleModelToViewModel(entity);
					var resultModel = ObjectMapper.Mapper.Map<RoleDto>(entity);
					return new BaseResponseModel<RoleDto>
					{
						Entity = resultModel,
						Result = DefaultEnums.Result.ok
					};
				}
				else return new BaseResponseModel < RoleDto >() { 
					Result = DefaultEnums.Result.error,
					Error = new Exception("Роль не найдена!") 
				};

			}
			catch (Exception ex)
			{
				//return BaseModelUtilities<RoleDto>.ErrorFormat(ex);
				return new BaseResponseModel<RoleDto>
				{
					Result = DefaultEnums.Result.error,
					Error = ex,
				};
			}
		}

		/// <summary>
		/// обновление записи о роли
		/// </summary>
		/// <param name="roleModel"></param>
		/// <returns></returns>
		public async Task<BaseResponseModel<RoleDto>> UpdateAsync(RoleDto roleModel)
		{
			try
			{
				var existing_entity = await _repositoryManager._roleRepository.GetByIdAsync(roleModel.Id);
				if(existing_entity != null)
				{
					existing_entity.RoleName = roleModel.RoleName;
					await _repositoryManager._roleRepository.UpdateAsync(existing_entity);
					//return roleModel;
					return new BaseResponseModel<RoleDto>
					{
						Entity = roleModel,
						Result = DefaultEnums.Result.ok
					};
				}
				else
				{
					//return new RoleDto();
					return new BaseResponseModel<RoleDto>
					{
						Entity = null,
						Result = DefaultEnums.Result.error,
						Error = new Exception("Данная роль не найдена!")
					};
				}
			}
			catch (Exception ex)
			{
				//return BaseModelUtilities<RoleDto>.ErrorFormat(ex);
				return new BaseResponseModel<RoleDto>
				{
					Result = DefaultEnums.Result.error,
					Error = ex,
				};
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
					existing_entity.IsRemoved = !existing_entity.IsRemoved;
					await _repositoryManager._roleRepository.UpdateAsync(existing_entity);
					return true;
				}
				return false;
			}
			catch(Exception ex)
			{
				throw new Exception(ex.Message);
			}
		}
	}
}
