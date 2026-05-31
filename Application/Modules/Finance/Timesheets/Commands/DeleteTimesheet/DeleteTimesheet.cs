using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Finance.Timesheets.Commands.DeleteTimesheet;

public record DeleteTimesheetCommand : IRequest<Result<DeleteTimesheetResponse>>
{
    public Guid Id { get; set; }
}

public class DeleteTimesheetResponse
{
}

public class DeleteTimesheetCommandValidator : AbstractValidator<DeleteTimesheetCommand>
{
    public DeleteTimesheetCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.TimeSheet>()
                    .AnyAsync(t => t.Id == id, cancellationToken);
            }).WithMessage("Timesheet not found.");
    }
}

public class DeleteTimesheetCommandHandler : IRequestHandler<DeleteTimesheetCommand, Result<DeleteTimesheetResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public DeleteTimesheetCommandHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<DeleteTimesheetResponse>> Handle(DeleteTimesheetCommand request,
        CancellationToken cancellationToken)
    {
        var timesheet = await _context.GetSet<Novologs.Domain.Entities.TimeSheet>()
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (timesheet == null)
        {
            return Result<DeleteTimesheetResponse>.Failure("Timesheet_001", "Timesheet not found.");
        }

        _context.GetSet<Novologs.Domain.Entities.TimeSheet>().Remove(timesheet);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<DeleteTimesheetResponse>.Success(new DeleteTimesheetResponse());
    }
}
