using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Departments.Queries.GetDepartment;

public class DepartmentDto
{
    public Guid? Id { get; set; }
    public Guid? ParentDepartmentId { get; set; }
    public LocalizableTextDto Name { get; set; } = null!;

    public int? EmployeeCount { get; set; }

    public DateTimeOffset Created { get; set; }
    public string? CreatedBy { get; set; }
    public DateTimeOffset LastModified { get; set; }
    public string? LastModifiedBy { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Domain.Entities.Department, DepartmentDto>()
                //TODO create automapper resolver to calculate employee count 
                ;
        }
    }
}
