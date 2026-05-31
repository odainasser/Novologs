namespace Novologs.Domain.Enums;

public enum DocumentNodeType : short
{
    Book = 0,
    Wiki = 1,
    Post = 2,
    Story = 3,
    Task = 4,
    Project = 5, 
    Milestone = 6, 
    Client = 7,
    Lead = 8,
    Vendor = 9,
    Contract = 10 
}

public enum DocumentNodeVisibility : short
{
    Private = 0,
    Team = 1,
    Public = 2,
}

public enum DocumentNodeStatus : short
{
    Published = 0,
    Unpublished = 1,
    Archives = 2,
}

public enum DocumentMemeberRole : short
{
    Viewer = 0,
    Editor = 1,
    Creator = 2,
}
