namespace Novologs.Application.Modules.Tasks.Tasks.Queries.GetTaskQuery;

public enum TaskCreatFilter : short
{
    MyCreated = 0,
    MyAssigned = 1,
    MyCreatedAndAssigned = 2,
    MyBacklog = 3,
    MyAll = 4,
    Task = 5,
    Backlog = 6,
    All = 7,
}

public enum TaskControlEntity : short
{
    None = 0,
    ParentTask = 1,
    Project = 2,
    Milestone = 3,
    Client = 4,
    ClientLead = 5,
    Vendor = 6,
    VendorContract = 7,
    General = 8,
}
