namespace Novologs.Application.CompanyBranches.Dto;

public class CompanyBranchDto
{
    public Guid Id { get; set; }
    public string? Code { get; set; }
    public long Serial { get; set; }
    public string Name { get; set; } = null!;
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Country { get; set; }
    public string? City { get; set; }
    public string? Address { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Domain.Entities.CompanyBranch, CompanyBranchDto>();
        }
    }
}
