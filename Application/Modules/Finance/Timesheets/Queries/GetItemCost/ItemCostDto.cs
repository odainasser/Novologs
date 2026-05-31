namespace Novologs.Application.Modules.Finance.ItemCosts.Queries.GetItemCost;

public class ItemCostDto
{
    public Guid? TaskId { get; set; } 
    public string? TaskCode { get; set;}
    public long? TaskSerial { get; set;}
    public decimal? Cost { get; set; }
    public TimeSpan Duration { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.ProjectTask, ItemCostDto>()
                .ForMember(dest => dest.TaskId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.TaskCode, opt => opt.MapFrom(src => src.Code))
                .ForMember(dest => dest.TaskSerial, opt => opt.MapFrom(src => src.Serial))
                .ForMember(dest => dest.Cost, opt => opt.Ignore()); // Cost is calculated in the handler
        }
    }

}
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
}
