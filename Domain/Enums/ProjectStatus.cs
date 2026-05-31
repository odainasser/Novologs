namespace Novologs.Domain.Enums;

public enum ProjectStatus : short
{
    Created = 0,
    Started = 1,
    Closed = 2,
    Cancelled = 3,
    InProgress = 4,
    Postpone = 5,
    Amended = 6,
    Reopened = 7,
    Stopped = 8
}

public enum ProjectLifeCycle : short
{
    Live = 0,
    Archived = 1
}
public enum ProjectType                                                                                                                                                                                                   
{                                                                                                                                                                                                                         
    Mission = 0,                                                                                                                                                                                                          
    Project = 1,                                                                                                                                                                                                          
    Ticketing = 2                                                                                                                                                                                                         
} 
