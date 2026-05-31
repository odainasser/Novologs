using Novologs.Application.Departments.Queries.GetDepartment;
using Novologs.Application.User.Dto;

namespace Novologs.Application.Hierarchy.DTOs;

public class OrganizationStructureDto
{
    public Guid? Id { get; set; }
    public Guid? ParentStructureId { get; set; }

    public Guid? EmployeeId { get; set; }
    public TenantUserDto? Employee { get; set; }

    public Guid? DepartmentId { get; set; }
    public DepartmentDto? Department { get; set; }

    public DateTimeOffset Created { get; set; }
    public string? CreatedBy { get; set; }
    public DateTimeOffset LastModified { get; set; }
    public string? LastModifiedBy { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Domain.Entities.OrganizationStructure, OrganizationStructureDto>();
        }
    }
}
