using Novologs.Application.User.Dto;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Client.Leads.Dto;

public class LeadMemberDto
{
    public Guid? Id { get; set; }
    public Guid LeadId { get; set; }
    public Guid MemberId { get; set; }
    public TenantUserDto? Member { get; set; }
    public LeadMemberPermission PermissionLevel { get; set; }
    public DateTimeOffset Created { get; set; }
    public string? CreatedBy { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.LeadMember, LeadMemberDto>();
        }
    }
}
