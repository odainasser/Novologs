namespace Novologs.Domain.Enums;

public enum ProjectTaskStatus : short
{
    NotStarted = 0,
    InProgress = 1,
    OnHold = 2,
    Submitted = 3,
    Completed = 4,
    Other = 5,
    CompletedLate = 6,
    Overdue = 7
}
