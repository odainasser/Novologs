using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Designations.DTOs;

public class DesignationDto
{
    public Guid? Id { get; set; } 
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
            CreateMap<Domain.Entities.Designation, DesignationDto>()
                .ForMember(dest => dest.EmployeeCount,
                    opt =>
                        opt.MapFrom(src => src.Employees.Count))
                ;
        }
    }
}
