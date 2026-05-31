using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Client.Leads.Commands.ChangeLeadStatus;

public record ChangeLeadStatusCommand : IRequest<Result<ChangeLeadStatusResponse>>
{
    public Guid Id { get; set; }
    public LeadStatus LeadStatus { get; set; }

    public double? AwardedValue { get; set; }
    public Guid? AwardedCurrencyId { get; set; }
    public DateTime? AwardedDate { get; set; }

    public DateTime? RejectedDate { get; set; }
    public Guid? RejectionReasonId { get; set; }

    public Guid? SaleStatusId { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<ChangeLeadStatusCommand, Novologs.Domain.Entities.ClientLead>()
                .ForMember(dest => dest.AwardedDate,
                    opt => opt.MapFrom(src =>
                        src.AwardedDate.HasValue
                            ? src.AwardedDate.Value.ToUniversalTime()
                            : (DateTime?)null))
                .ForMember(dest => dest.RejectedDate,
                    opt => opt.MapFrom(src =>
                        src.RejectedDate.HasValue
                            ? src.RejectedDate.Value.ToUniversalTime()
                            : (DateTime?)null))
                .ForAllMembers(opts => opts.Condition((_, _, srcMember) => srcMember != null))
                ;
        }
    }
}

public class ChangeLeadStatusResponse
{
}

public class ChangeLeadStatusCommandHandler : IRequestHandler<ChangeLeadStatusCommand, Result<ChangeLeadStatusResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public ChangeLeadStatusCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<ChangeLeadStatusResponse>> Handle(ChangeLeadStatusCommand request,
        CancellationToken cancellationToken)
    {
        var lead = await _context.GetSet<Novologs.Domain.Entities.ClientLead>()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (lead == null)
        {
            return Result<ChangeLeadStatusResponse>.Failure("Lead_003", "Lead not found");
        }

        _mapper.Map(request, lead);
        switch (request.LeadStatus)
        {
            case LeadStatus.Open:
                lead.AwardedValue = null;
                lead.AwardedCurrencyId = null;
                lead.AwardedDate = null;
                lead.RejectedDate = null;
                lead.RejectionReasonId = null;
                break;
            case LeadStatus.Awarded:
                lead.RejectedDate = null;
                lead.RejectionReasonId = null;
                break;
            case LeadStatus.Rejected:
                lead.AwardedValue = null;
                lead.AwardedCurrencyId = null;
                lead.AwardedDate = null;
                break;
        }

        _context.GetSet<Novologs.Domain.Entities.ClientLead>().Update(lead);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<ChangeLeadStatusResponse>.Success(new ChangeLeadStatusResponse());
    }
}
