using Novologs.Application.Common.Behaviours;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Client.Leads.LeadUpdates.Commands.UpdateLeadUpdate;

[AuthorizePermission(Novologs.Domain.Constants.Permissions.Clients.UpdateLeadUpdate)]
public record UpdateLeadUpdateCommand : IRequest<Result<UpdateLeadUpdateResponse>>
{
    public Guid Id { get; set; }
    public string? Description { get; set; }
    public string? Status { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateLeadUpdateCommand, Novologs.Domain.Entities.LeadUpdate>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}

public class UpdateLeadUpdateResponse { }

public class UpdateLeadUpdateCommandValidator : AbstractValidator<UpdateLeadUpdateCommand>
{
    public UpdateLeadUpdateCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
                await context.GetSet<Novologs.Domain.Entities.LeadUpdate>()
                    .AnyAsync(lu => lu.Id == id, cancellationToken))
            .WithMessage("LeadUpdate not found.");

        RuleFor(v => v.Description)
            .MaximumLength(4096).WithMessage("Description must not exceed 4096 characters.")
            .When(v => v.Description != null);

        RuleFor(v => v.Status)
            .MaximumLength(500).WithMessage("Status must not exceed 500 characters.")
            .When(v => v.Status != null);
    }
}

public class UpdateLeadUpdateCommandHandler : IRequestHandler<UpdateLeadUpdateCommand, Result<UpdateLeadUpdateResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateLeadUpdateCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateLeadUpdateResponse>> Handle(UpdateLeadUpdateCommand request, CancellationToken cancellationToken)
    {
        var leadUpdate = await _context.GetSet<Novologs.Domain.Entities.LeadUpdate>()
            .FirstOrDefaultAsync(lu => lu.Id == request.Id, cancellationToken);

        if (leadUpdate == null)
            return Result<UpdateLeadUpdateResponse>.Failure("LeadUpdate_001", "LeadUpdate not found.");

        if (request.Description != null)
            leadUpdate.Description = request.Description;

        if (request.Status != null)
            leadUpdate.Status = request.Status;

        _context.GetSet<Novologs.Domain.Entities.LeadUpdate>().Update(leadUpdate);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<UpdateLeadUpdateResponse>.Success(new UpdateLeadUpdateResponse());
    }
}
