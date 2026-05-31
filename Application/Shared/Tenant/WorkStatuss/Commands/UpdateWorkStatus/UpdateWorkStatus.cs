using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.WorkStatuss.Commands.UpdateWorkStatus;

public record
    UpdateWorkStatusCommand : IRequest<Result<UpdateWorkStatusResponse>>
{
    public Guid Id { get; set; }
    public LocalizableTextDto? Name { get; set; }
    public bool? IsActive { get; set; }
    public string? Color { get; set; }


    public class UpdateWorkStatusCommandMapping : Profile
    {
        public UpdateWorkStatusCommandMapping()
        {
            CreateMap<UpdateWorkStatusCommand, Domain.Entities.WorkStatus>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        }
    }
}

public class UpdateWorkStatusResponse
{
}

public class UpdateWorkStatusCommandValidator : AbstractValidator<UpdateWorkStatusCommand>
{
    public UpdateWorkStatusCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Id)
            .NotNull()
            .WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
                await context.GetSet<Domain.Entities.WorkStatus>().AnyAsync(ws => ws.Id == id, cancellationToken))
            .WithMessage("The specified Work Status does not exist.");
        RuleFor(v => v.Name!.Value)
            .MustAsync(async (name, cancellationToken) =>
                !await context.GetSet<Domain.Entities.WorkStatus>()
                    .AnyAsync(ws => ws.Name.Value == name, cancellationToken))
            .WithMessage("The specified Work Status Name already exists.");
    }
}

public class UpdateWorkStatusCommandHandler : IRequestHandler<UpdateWorkStatusCommand, Result<UpdateWorkStatusResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public UpdateWorkStatusCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<UpdateWorkStatusResponse>> Handle(UpdateWorkStatusCommand request,
        CancellationToken cancellationToken)
    {
        var entity = await _context.GetSet<Domain.Entities.WorkStatus>()
            .Include(ws => ws.Name)
            .FirstOrDefaultAsync(ws => ws.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            return Result<UpdateWorkStatusResponse>.Failure("WorkStatus_001", "Work Status not found.");
        }

        _mapper.Map(request, entity);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<UpdateWorkStatusResponse>.Success(new UpdateWorkStatusResponse());
    }
}
