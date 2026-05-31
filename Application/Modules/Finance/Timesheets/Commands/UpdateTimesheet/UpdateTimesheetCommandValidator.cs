using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Finance.Timesheets.Commands.UpdateTimesheet;

public class UpdateTimesheetCommandValidator : AbstractValidator<UpdateTimesheetCommand>
{
    public UpdateTimesheetCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.TimeSheet>()
                    .AnyAsync(t => t.Id == id, cancellationToken);
            }).WithMessage("Timesheet not found.");
        RuleFor(v => v.TaskId)
            .MustAsync(async (taskId, cancellationToken) =>
            {
                if (taskId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                    .AnyAsync(t => t.Id == taskId, cancellationToken);
            }).WithMessage("Task not found.");
        RuleFor(v => v.TimeSlots)
            .Must(timeSlots => timeSlots == null || timeSlots.DistinctBy(ts => ts.StartTime).Count() == timeSlots.Count)
            .WithMessage("Duplicate time slots are not allowed.");
        //Time slots cannot overlap with existing time slots or each other.
        RuleFor(v => v.TimeSlots)
            .Must((command, timeSlots) =>
            {
                if (timeSlots == null) return true;

                if (Guid.TryParse(user.Id, out var userId))
                {
                    return false; // User not found
                }

                var timesheet = context.GetSet<Novologs.Domain.Entities.TimeSheet>()
                    .FirstOrDefault(t => t.Id == command.Id);
                if (timesheet == null)
                {
                    return false; // Timesheet not found
                }

                var existingTimeSlots = context.GetSet<Novologs.Domain.Entities.TimeSlot>()
                    .Include(ts => ts.TimeSheet)
                    .Where(ts =>
                        ts.TimeSheet!.UserId == userId && ts.TimeSheetId != command.Id &&
                        ts.TimeSheet.Date.Date == timesheet.Date)
                    .ToList();

                var allTimeSlots = timeSlots.Select(ts => new
                {
                    ts.Id, ts.StartTime, EndTime = ts.StartTime.AddMinutes((double)ts.DurationInMinutes)
                }).ToList();

                allTimeSlots.AddRange(existingTimeSlots.Where(ets => !timeSlots.Any(ts => ts.Id == ets.Id))
                    .Select(ets => new { ets.Id, ets.StartTime, EndTime = ets.StartTime.Add(ets.Duration) }));
                for (int i = 0; i < allTimeSlots.Count; i++)
                {
                    for (int j = i + 1; j < allTimeSlots.Count; j++)
                    {
                        if (allTimeSlots[i].StartTime < allTimeSlots[j].EndTime &&
                            allTimeSlots[j].StartTime < allTimeSlots[i].EndTime)
                        {
                            return false; // Overlap detected
                        }
                    }
                }

                return true;
            }).WithMessage("Time slots cannot overlap.");
    }
}
