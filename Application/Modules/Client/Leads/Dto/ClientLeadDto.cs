using Novologs.Application.Modules.Client.Clients.Dto;
using Novologs.Application.Currencys.Dto;
using Novologs.Application.User.Dto;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Client.Leads.Dto;

public class ClientLeadDto
{
    public Guid? Id { get; set; }
    public string? Code { get; set; }
    public long Serial { get; set; }

    public string Name { get; set; } = null!;

    public Guid CreatorId { get; set; }
    public TenantUserDto? Creator { get; set; }
    
    public Guid? ClientId { get; set; }
    public ClientDto? Client { get; set; }

    public bool IsShared { get; set; }
    public List<LeadMemberDto> LeadMembers { get; set; } = new();

    public Guid? LeadSourceId { get; set; }
    public LeadSourceDto? LeadSource { get; set; }

    public double Value { get; set; }
    public Guid CurrencyId { get; set; }
    public CurrencyDto? Currency { get; set; }
    public double? Probability { get; set; }

    public DateTime? ExpectedAwardedDate { get; set; }
    public LeadStatus LeadStatus { get; set; } = LeadStatus.Open;

    public Guid SaleStatusId { get; set; }
    public LeadSaleStatusDto? SaleStatus { get; set; }

    public double? AwardedValue { get; set; }
    public Guid? AwardedCurrencyId { get; set; }
    public CurrencyDto? AwardedCurrency { get; set; }

    public DateTime? AwardedDate { get; set; }

    public DateTime? RejectedDate { get; set; }
    public Guid? RejectionReasonId { get; set; }

    public LeadRejectionReasonDto? RejectionReason { get; set; }

    public Guid? RootFolderId { get; set; }

    public DateTimeOffset Created { get; set; }
    public string? CreatedBy { get; set; }
    public DateTimeOffset LastModified { get; set; }
    public string? LastModifiedBy { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.ClientLead, ClientLeadDto>();
        }
    }
}
