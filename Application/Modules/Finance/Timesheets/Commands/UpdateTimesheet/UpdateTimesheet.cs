using Novologs.Application.Modules.Finance.Timesheets.Commands.AddTimesheet;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Finance.Timesheets.Commands.UpdateTimesheet;

public record UpdateTimesheetCommand : IRequest<Result<UpdateTimesheetResponse>>
{
    public Guid Id { get; set; }
    public Guid? TaskId { get; set; }
    public DateTime? Date { get; set; }
    public List<UpdateTimeSlotDto>? TimeSlots { get; set; } = new();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateTimesheetCommand, Novologs.Domain.Entities.TimeSheet>()
                .ForMember(dest => dest.TimeSlots, opt => opt.Ignore());
        }
    }
}

public class UpdateTimesheetResponse
{
}

public class UpdateTimesheetCommandHandler : IRequestHandler<UpdateTimesheetCommand, Result<UpdateTimesheetResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public UpdateTimesheetCommandHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<UpdateTimesheetResponse>> Handle(UpdateTimesheetCommand request,
        CancellationToken cancellationToken)
    {
        var timesheet = await _context.GetSet<Novologs.Domain.Entities.TimeSheet>()
            .Include(t => t.TimeSlots)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (timesheet == null)
        {
            return Result<UpdateTimesheetResponse>.Failure("Timesheet_001", "Timesheet not found.");
        }

        if (request.TaskId != null)
        {
            timesheet.TaskId = request.TaskId.Value;
        }

        if (request.Date != null)
        {
            timesheet.Date = request.Date.Value;
        }

        if (request.TimeSlots != null)
        {
            var timeSlotsToAdd = request.TimeSlots
                .Where(ts => timesheet.TimeSlots.All(ets => ets.Id != ts.Id))
                .ToList();

            var timeSlotsToRemove = timesheet.TimeSlots
                .Where(ets => request.TimeSlots.All(ts => ts.Id != ets.Id))
                .ToList();

            var timeSlotsToUpdate = request.TimeSlots
                .Where(ts => timesheet.TimeSlots.Any(ets => ets.Id == ts.Id))
                .ToList();

            foreach (var timeSlotDto in timeSlotsToAdd)
            {
                var timeSlot = _mapper.Map<Novologs.Domain.Entities.TimeSlot>(timeSlotDto);
                timeSlot.TimeSheetId = timesheet.Id;
                _context.GetSet<Novologs.Domain.Entities.TimeSlot>().Add(timeSlot);
            }

            foreach (var timeSlotToRemove in timeSlotsToRemove)
            {
                _context.GetSet<Novologs.Domain.Entities.TimeSlot>().Remove(timeSlotToRemove);
            }

            foreach (var timeSlotDto in timeSlotsToUpdate)
            {
                var timeSlot = timesheet.TimeSlots.FirstOrDefault(ts => ts.Id == timeSlotDto.Id);
                if (timeSlot != null)
                {
                    _mapper.Map(timeSlotDto, timeSlot);
                }
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return Result<UpdateTimesheetResponse>.Success(new UpdateTimesheetResponse());
    }
}
