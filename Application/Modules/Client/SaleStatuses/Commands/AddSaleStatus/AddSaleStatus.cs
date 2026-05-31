using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Client.SaleStatuses.Commands.AddSaleStatus;

public record AddSaleStatusCommand : IRequest<Result<AddSaleStatusResponse>>
{
    public LocalizableTextDto Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddSaleStatusCommand, Novologs.Domain.Entities.LeadSaleStatus>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }
}

public class AddSaleStatusResponse
{
    public Guid Id { get; set; }
}

public class AddSaleStatusCommandValidator : AbstractValidator<AddSaleStatusCommand>
{
    public AddSaleStatusCommandValidator(ITenantDbContext context)
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
                return !await context.GetSet<Novologs.Domain.Entities.LeadSaleStatus>()
                    .AnyAsync(c => c.Name.Value.Trim().ToLower() == name.Value.Trim().ToLower() && c.NameId != name.Id,
                        cancellationToken);
            }).WithMessage("Name already used.");
    }
}

public class AddSaleStatusCommandHandler : IRequestHandler<AddSaleStatusCommand, Result<AddSaleStatusResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public AddSaleStatusCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<AddSaleStatusResponse>> Handle(AddSaleStatusCommand request,
        CancellationToken cancellationToken)
    {
        var leadSaleStatus = _mapper.Map<Novologs.Domain.Entities.LeadSaleStatus>(request);
        await _context.GetSet<Novologs.Domain.Entities.LeadSaleStatus>()
            .AddAsync(leadSaleStatus, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<AddSaleStatusResponse>.Success(
            new AddSaleStatusResponse() { Id = leadSaleStatus.Id });
    }
}
