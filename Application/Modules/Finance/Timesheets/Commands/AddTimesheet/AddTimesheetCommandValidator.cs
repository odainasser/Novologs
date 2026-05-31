using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Finance.Timesheets.Commands.AddTimesheet;

public class AddTimesheetCommandValidator : AbstractValidator<AddTimesheetCommand>
{
    public AddTimesheetCommandValidator(ITenantDbContext dbContext, IUser user)
    {
        RuleFor(x => x.TaskId)
            .NotEmpty().WithMessage("Task ID is required.");
        RuleFor(x => x.TaskId)
            .MustAsync(async (taskId, cancellationToken) =>
                await dbContext.GetSet<Novologs.Domain.Entities.ProjectTask>()
                    .AnyAsync(t => t.Id == taskId, cancellationToken))
            .WithMessage("Task ID is not valid.");


        RuleFor(x => x.Date)
            .NotEmpty().WithMessage("Date is required.");

        RuleFor(x => x.TimeSlots)
            .NotEmpty().WithMessage("At least one time slot is required.");
        RuleFor(x => x.TimeSlots)
            .Must((command, timeSlots, context) =>
            {
                var userId = user.Id;
                if (string.IsNullOrEmpty(userId))
                {
                    context.AddFailure("User not found.");
                    return false;
                }

                var existingTimeSlots = dbContext.GetSet<Novologs.Domain.Entities.TimeSlot>()
                    .Include(ts => ts.TimeSheet)
                    .Where(ts =>
                        ts.TimeSheet!.UserId == Guid.Parse(userId) && ts.TimeSheet.Date.Date == command.Date.Date)
                    .ToList();

                var allTimeSlots = timeSlots.Select(ts => new
                {
                    StartTime = ts.StartTime, EndTime = ts.StartTime.AddMinutes((double)ts.DurationInMinutes)
                }).ToList();

                allTimeSlots.AddRange(existingTimeSlots.Select(ts => new
                {
                    StartTime = ts.StartTime, EndTime = ts.StartTime.Add(ts.Duration)
                }));

                for (int i = 0; i < allTimeSlots.Count; i++)
                {
                    for (int j = i + 1; j < allTimeSlots.Count; j++)
                    {
                        if (allTimeSlots[i].StartTime < allTimeSlots[j].EndTime &&
                            allTimeSlots[j].StartTime < allTimeSlots[i].EndTime)
                        {
                            context.MessageFormatter.AppendArgument("StartTime1", allTimeSlots[i].StartTime);
                            context.MessageFormatter.AppendArgument("EndTime1", allTimeSlots[i].EndTime);
                            context.MessageFormatter.AppendArgument("StartTime2", allTimeSlots[j].StartTime);
                            context.MessageFormatter.AppendArgument("EndTime2", allTimeSlots[j].EndTime);
                            return false;
                        }
                    }
                }

                return true;
            }).WithMessage(
                "Time slots cannot overlap. Slot from {StartTime1} to {EndTime1} overlaps with slot from {StartTime2} to {EndTime2}.");
    }
}
