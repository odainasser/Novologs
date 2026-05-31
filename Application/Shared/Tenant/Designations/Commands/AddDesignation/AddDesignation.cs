using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Designations.Commands.AddDesignation;

public record AddDesignationCommand : IRequest<Result<AddDesignationResponse>>
{
    public required LocalizableTextDto Name { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddDesignationCommand, Domain.Entities.Designation>();
        }
    }
}

public class AddDesignationCommandValidator : AbstractValidator<AddDesignationCommand>
{
    public AddDesignationCommandValidator(ITenantDbContext context)
    {
        
        RuleFor(v => v.Name).NotNull().WithMessage("Name is required.");
        RuleFor(v => v.Name.Value).NotEmpty().WithMessage("Name is required.");
        RuleFor(v => v.Name.Value)
            .MustAsync(async (name, cancellationToken) =>
            {
                return !await context.GetSet<Domain.Entities.Designation>()
                    .AnyAsync(d => d.Name.Value.ToLower().Trim() == name.ToLower().Trim(), cancellationToken);
            }).WithMessage("The specified name already exists.");
    }
}

public class AddDesignationResponse
{
    public Guid Id { get; set; }
}

public class AddDesignationCommandHandler : IRequestHandler<AddDesignationCommand, Result<AddDesignationResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public AddDesignationCommandHandler(
        ITenantDbContext context,
        IMapper mapper
    )
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<AddDesignationResponse>> Handle(AddDesignationCommand request,
        CancellationToken cancellationToken)
    {
        var designation = _mapper.Map<Domain.Entities.Designation>(request);
        await _context.GetSet<Domain.Entities.Designation>().AddAsync(designation, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<AddDesignationResponse>.Success(new AddDesignationResponse { Id = designation.Id });
    }
}
