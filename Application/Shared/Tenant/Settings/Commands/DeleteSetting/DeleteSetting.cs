using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Settings.Commands.DeleteSetting;

public record DeleteSettingCommand : IRequest<Result<DeleteSettingResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteSettingResponse
{
}

public class DeleteSettingCommandValidator : AbstractValidator<DeleteSettingCommand>
{
    public DeleteSettingCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Domain.Entities.Setting>()
                    .AnyAsync(s => s.Id == id, cancellationToken);
            }).WithMessage("Setting not found.");
    }
}

public class DeleteSettingCommandHandler : IRequestHandler<DeleteSettingCommand, Result<DeleteSettingResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public DeleteSettingCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<DeleteSettingResponse>> Handle(DeleteSettingCommand request,
        CancellationToken cancellationToken)
    {
        //make seeting incative
        var setting = await _context.GetSet<Domain.Entities.Setting>()
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (setting == null)
        {
            return Result<DeleteSettingResponse>.Failure("Setting_001", "Setting not found.");
        }

        setting.IsActive = false;
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DeleteSettingResponse>.Success(new DeleteSettingResponse());
    }
}
