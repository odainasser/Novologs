using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.WorkStatuss.Commands.AddWorkStatus;

public record AddWorkStatusCommand : IRequest<Result<AddWorkStatusResponse>>
{
    public LocalizableTextDto? Name { get; set; }
    public bool? IsActive { get; set; }
    public string? Color { get; set; }
    public class AddWorkStatusCommandMapping : Profile
    {
        public AddWorkStatusCommandMapping()
        {
            CreateMap<AddWorkStatusCommand, Domain.Entities.WorkStatus>();
        }
    }
}

public class AddWorkStatusResponse
{
    public Guid Id { get; set; }
}

public class AddWorkStatusCommandValidator : AbstractValidator<AddWorkStatusCommand>
{
    public AddWorkStatusCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Name)
            .NotNull()
            .WithMessage("Name is required.");
        RuleFor(v => v.Name!.Value)
            .NotEmpty()
            .WithMessage("Name value is required.");
        RuleFor(v => v.Name!.Value)
            .MustAsync(async (name, cancellationToken) =>
                !await context.GetSet<Domain.Entities.WorkStatus>()
                    .AnyAsync(ws => ws.Name.Value == name, cancellationToken))
            .WithMessage("The specified Work Status Name already exists.");
    }
}

public class AddWorkStatusCommandHandler : IRequestHandler<AddWorkStatusCommand, Result<AddWorkStatusResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public AddWorkStatusCommandHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<AddWorkStatusResponse>> Handle(AddWorkStatusCommand request,
        CancellationToken cancellationToken)
    {
        var entity = _mapper.Map<Domain.Entities.WorkStatus>(request);

        _context.GetSet<Domain.Entities.WorkStatus>().Add(entity);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<AddWorkStatusResponse>.Success(new AddWorkStatusResponse() { Id = entity.Id });
    }
}
