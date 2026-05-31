using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.WorkStatuss.Commands.ChangMyWorkStatus;

public record ChangMyWorkStatusCommand : IRequest<Result<ChangMyWorkStatusResponse>>
{
    public Guid? WorkStatusId { get; set; }
    public DateTimeOffset? StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }
}

public class ChangMyWorkStatusResponse
{
}

public class ChangMyWorkStatusCommandValidator : AbstractValidator<ChangMyWorkStatusCommand>
{
    public ChangMyWorkStatusCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.WorkStatusId)
            .MustAsync(async (id, cancellationToken) =>
            {
                if (id == null) return true;
                return await context.GetSet<Domain.Entities.WorkStatus>()
                    .AnyAsync(ws => ws.Id == id, cancellationToken);
            })
            .WithMessage("The specified Work Status does not exist.");
        RuleFor(v => v.EndDate)
            .Must((request, endDate) => endDate == null || endDate > (request.StartDate ?? DateTimeOffset.UtcNow))
            .WithMessage("End date must be null or later than the start date or current time.");
    }
}

public class
    ChangMyWorkStatusCommandHandler : IRequestHandler<ChangMyWorkStatusCommand, Result<ChangMyWorkStatusResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;

    public ChangMyWorkStatusCommandHandler(ITenantDbContext context, IUser user, IMapper mapper)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<ChangMyWorkStatusResponse>> Handle(ChangMyWorkStatusCommand request,
        CancellationToken cancellationToken)
    {
        var userId = _user.IdGuid;
        if (userId == null)
        {
            return Result<ChangMyWorkStatusResponse>.Failure("User_001", "User not found.");
        }

        var userWorkStatus = await _context.GetSet<Domain.Entities.UserWorkStatus>()
            .Where(uws => uws.UserId == userId && uws.EndDate == null)
            .ToListAsync(cancellationToken);

        foreach (var status in userWorkStatus)
        {
            status.EndDate = DateTimeOffset.UtcNow;
        }

        var newWorkStatus = new Domain.Entities.UserWorkStatus()
        {
            UserId = userId.Value,
            WorkStatusId = request.WorkStatusId,
            StartDate = request.StartDate ?? DateTimeOffset.UtcNow,
            EndDate = request.EndDate?.ToUniversalTime()
        };

        _context.GetSet<Domain.Entities.UserWorkStatus>().Add(newWorkStatus);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<ChangMyWorkStatusResponse>.Success(new ChangMyWorkStatusResponse());
    }
}
