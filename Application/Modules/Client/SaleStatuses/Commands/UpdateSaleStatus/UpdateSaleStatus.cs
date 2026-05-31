using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Client.SaleStatuses.Commands.UpdateSaleStatus;

public record UpdateSaleStatusCommand : IRequest<Result<UpdateSaleStatusResponse>>
{
    public Guid Id { get; set; }
    public LocalizableTextDto Name { get; set; } = null!;

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateSaleStatusCommand, Novologs.Domain.Entities.LeadSaleStatus>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name));
        }
    }
}

public class UpdateSaleStatusResponse
{
}

public class UpdateSaleStatusCommandValidator : AbstractValidator<UpdateSaleStatusCommand>
{
    public UpdateSaleStatusCommandValidator(ITenantDbContext context)
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
                return !await context.GetSet<Novologs.Domain.Entities.LeadSaleStatus>()
                    .AnyAsync(c => c.Name.Value.Trim().ToLower() == name.Value.Trim().ToLower() && c.NameId != name.Id,
                        cancellationToken);
            }).WithMessage("Name already used.");
    }
}

public class UpdateSaleStatusCommandHandler : IRequestHandler<UpdateSaleStatusCommand, Result<UpdateSaleStatusResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateSaleStatusCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateSaleStatusResponse>> Handle(UpdateSaleStatusCommand request,
        CancellationToken cancellationToken)
    {
        var leadSaleStatus = await _context.GetSet<Novologs.Domain.Entities.LeadSaleStatus>()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (leadSaleStatus == null)
        {
            return Result<UpdateSaleStatusResponse>.Failure("SaleStatus_001", "Sale Status not found.");
        }

        _mapper.Map(request, leadSaleStatus);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<UpdateSaleStatusResponse>.Success(new UpdateSaleStatusResponse());
    }
}
