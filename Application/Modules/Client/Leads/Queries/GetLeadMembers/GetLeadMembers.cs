using Novologs.Application.Modules.Client.Leads.Dto;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Client.Leads.Queries.GetLeadMembers;

public record GetLeadMembersQuery : IRequest<Result<List<LeadMemberDto>>>
{
    public Guid LeadId { get; set; }
}

public class GetLeadMembersQueryValidator : AbstractValidator<GetLeadMembersQuery>
{
    public GetLeadMembersQueryValidator(ITenantDbContext context)
    {
        RuleFor(x => x.LeadId)
            .NotEmpty().WithMessage("Lead ID is required.")
            .MustAsync(async (leadId, cancellationToken) =>
            {
                return await context.GetSet<ClientLead>()
                    .AnyAsync(l => l.Id == leadId, cancellationToken);
            }).WithMessage("Lead not found.");
    }
}

public class GetLeadMembersQueryHandler : IRequestHandler<GetLeadMembersQuery, Result<List<LeadMemberDto>>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetLeadMembersQueryHandler(
        ITenantDbContext context,
        IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<List<LeadMemberDto>>> Handle(GetLeadMembersQuery request, CancellationToken cancellationToken)
    {
        var leadMembers = await _context.GetSet<LeadMember>()
            .Where(lm => lm.LeadId == request.LeadId && !lm.IsDeleted)
            .Include(lm => lm.Member)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<LeadMemberDto>>(leadMembers);
        
        return Result<List<LeadMemberDto>>.Success(dtos);
    }
}
