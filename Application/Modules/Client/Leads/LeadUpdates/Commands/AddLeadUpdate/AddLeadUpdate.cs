using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Client.Leads.LeadUpdates.Commands.AddLeadUpdate;

[AuthorizePermission(Novologs.Domain.Constants.Permissions.Clients.AddLeadUpdate)]
public record AddLeadUpdateCommand : IRequest<Result<AddLeadUpdateResponse>>
{
    public Guid LeadId { get; set; }
    public string Description { get; set; } = null!;
    public string? Status { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddLeadUpdateCommand, Novologs.Domain.Entities.LeadUpdate>();
        }
    }
}

public class AddLeadUpdateResponse
{
    public Guid Id { get; set; }
}

public class AddLeadUpdateCommandValidator : AbstractValidator<AddLeadUpdateCommand>
{
    public AddLeadUpdateCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.LeadId)
            .NotEmpty().WithMessage("LeadId is required.")
            .MustAsync(async (leadId, cancellationToken) =>
                await context.GetSet<Novologs.Domain.Entities.ClientLead>()
                    .AnyAsync(l => l.Id == leadId, cancellationToken))
            .WithMessage("Lead not found.");

        RuleFor(v => v.Description)
            .NotEmpty().WithMessage("Description is required.")
            .MaximumLength(4096).WithMessage("Description must not exceed 4096 characters.");

        RuleFor(v => v.Status)
            .MaximumLength(500).WithMessage("Status must not exceed 500 characters.")
            .When(v => v.Status != null);
    }
}

public class AddLeadUpdateCommandHandler : IRequestHandler<AddLeadUpdateCommand, Result<AddLeadUpdateResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public AddLeadUpdateCommandHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<AddLeadUpdateResponse>> Handle(AddLeadUpdateCommand request, CancellationToken cancellationToken)
    {
        var leadUpdate = _mapper.Map<Novologs.Domain.Entities.LeadUpdate>(request);
        leadUpdate.CreatorId = Guid.Parse(_user.Id!);
        await _context.GetSet<Novologs.Domain.Entities.LeadUpdate>().AddAsync(leadUpdate, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<AddLeadUpdateResponse>.Success(new AddLeadUpdateResponse { Id = leadUpdate.Id });
    }
}
