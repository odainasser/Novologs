using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Client.RejectionReasons.Commands.AddRejectionReason;

public record AddRejectionReasonCommand : IRequest<Result<AddRejectionReasonResponse>>
{
    public LocalizableTextInputDto? Name { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddRejectionReasonCommand, Novologs.Domain.Entities.LeadRejectionReason>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
            ;
        }
    }
}

public class AddRejectionReasonResponse
{
    public Guid Id { get; set; }
}

public class AddRejectionReasonCommandValidator : AbstractValidator<AddRejectionReasonCommand>
{
    public AddRejectionReasonCommandValidator(ITenantDbContext context)
    {
    
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
    AddRejectionReasonCommandHandler : IRequestHandler<AddRejectionReasonCommand, Result<AddRejectionReasonResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public AddRejectionReasonCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<AddRejectionReasonResponse>> Handle(AddRejectionReasonCommand request,
        CancellationToken cancellationToken)
    {
        var leadRejectionReason = _mapper.Map<Novologs.Domain.Entities.LeadRejectionReason>(request);
        await _context.GetSet<Novologs.Domain.Entities.LeadRejectionReason>()
            .AddAsync(leadRejectionReason, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<AddRejectionReasonResponse>.Success(
            new AddRejectionReasonResponse() { Id = leadRejectionReason.Id });
    }
}
