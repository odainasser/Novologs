using Novologs.Application.Modules.Finance.Timesheets.Queries.GetTimesheet;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Finance.TimeSlots.Queries.GetAvailableTimeSlots;

public record GetAvailableTimeSlotsQuery : IRequest<Result<GetAvailableTimeSlotsResponse>>
{
    public DateTime StartDateTime { get; set; }
    public Guid UserId { get; set; }
}

public class GetAvailableTimeSlotsResponse : FilteredResult<TimeSlotDto>
{
}

public class GetAvailableTimeSlotsQueryValidator : AbstractValidator<GetAvailableTimeSlotsQuery>
{
    public GetAvailableTimeSlotsQueryValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.UserId)
            .NotEmpty().WithMessage("UserId is required.")
            .MustAsync(async (userId, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.TenantUser>()
                    .AnyAsync(u => u.Id == userId, cancellationToken);
            }).WithMessage("UserId is invalid.");

        RuleFor(v => v.StartDateTime)
            .NotEmpty().WithMessage("StartDate is required.");
    }
}

public class
    GetAvailableTimeSlotsQueryHandler : IRequestHandler<GetAvailableTimeSlotsQuery,
    Result<GetAvailableTimeSlotsResponse>>
{
    private readonly UserManager<TenantUser> _userManager;
    private readonly ITenantDbContext _context;

    public GetAvailableTimeSlotsQueryHandler(ITenantDbContext context, IUser user, IMapper mapper,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<Result<GetAvailableTimeSlotsResponse>> Handle(GetAvailableTimeSlotsQuery request,
        CancellationToken cancellationToken)
    {
        var startTime = request.StartDateTime;
        var endOfDay = request.StartDateTime.AddDays(1);
        var occupiedTimeSlots = await _context.GetSet<Novologs.Domain.Entities.TimeSlot>()
            .Include(ts => ts.TimeSheet)
            .Where(ts => ts.TimeSheet!.UserId == request.UserId && startTime < ts.TimeSheet.Date &&
                         endOfDay > ts.TimeSheet.Date)
            .Select(ts => new { ts.StartTime, EndTime = ts.StartTime.Add(ts.Duration) })
            .ToListAsync(cancellationToken);
        var availableTimeSlots = new List<TimeSlotDto>();
        while (startTime < endOfDay)
        {
            var isOccupied = occupiedTimeSlots.Any(ots =>
                startTime < ots.EndTime && startTime.AddMinutes(15) > ots.StartTime);

            if (!isOccupied)
            {
                availableTimeSlots.Add(new TimeSlotDto
                {
                    StartTime = startTime, DurationInMinutes = 15 // Assuming 15-minute slots
                });
            }

            startTime = startTime.AddMinutes(15);
        }

        var result = new GetAvailableTimeSlotsResponse { Items = availableTimeSlots, Total = availableTimeSlots.Count };
        return Result<GetAvailableTimeSlotsResponse>.Success(result);
    }
}
