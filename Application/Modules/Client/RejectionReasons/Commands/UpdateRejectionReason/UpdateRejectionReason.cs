using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Client.RejectionReasons.Commands.UpdateRejectionReason;

public record UpdateRejectionReasonCommand : IRequest<Result<UpdateRejectionReasonResponse>>
{
    public Guid Id { get; set; }
    public LocalizableTextInputDto? Name { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateRejectionReasonCommand, Novologs.Domain.Entities.LeadRejectionReason>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }
}

public class UpdateRejectionReasonResponse
{
}

public class UpdateRejectionReasonCommandValidator : AbstractValidator<UpdateRejectionReasonCommand>
{
    public UpdateRejectionReasonCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Name)
            .NotNull().WithMessage("Name is required.");
        RuleFor(v => v.Name!.Value)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters.");
        RuleFor(v => v.Name)
            .MustAsync(async (name, cancellationToken) =>
            {
                if (name == null) return true;
                return !await context.GetSet<Novologs.Domain.Entities.LeadRejectionReason>()
                    .AnyAsync(c => c.Name.Value.Trim().ToLower() == name.Value.Trim().ToLower() && c.NameId != name.Id,
                        cancellationToken);
            }).WithMessage("Name already used.");
    }
}

public class
    UpdateRejectionReasonCommandHandler : IRequestHandler<UpdateRejectionReasonCommand,
    Result<UpdateRejectionReasonResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateRejectionReasonCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateRejectionReasonResponse>> Handle(UpdateRejectionReasonCommand request,
        CancellationToken cancellationToken)
    {
        var leadRejectionReason = await _context.GetSet<Novologs.Domain.Entities.LeadRejectionReason>()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (leadRejectionReason == null)
        {
            return Result<UpdateRejectionReasonResponse>.Failure("RejectionReason_001", "Rejection Reason not found.");
        }

        _mapper.Map(request, leadRejectionReason);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<UpdateRejectionReasonResponse>.Success(new UpdateRejectionReasonResponse());
    }
}
