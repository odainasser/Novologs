using Novologs.Application.User.Dto;

namespace Novologs.Application.Modules.Project.Projects.Dto;

public class ClientDto
{
    public Guid? Id { get; set; }
    public string? Code { get; set; }
    public long Serial { get; set; }

    public string Name { get; set; } = null!;
    public string Website { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phonenumber { get; set; } = null!;
    public string Emirate { get; set; } = null!;
    public double LocationLatitude { get; set; }
    public double LocationLongitude { get; set; }


    public Guid CreatorId { get; set; }
    public TenantUserDto? Creator { get; set; }
    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.Client, ClientDto>();
        }
    }

} 
