using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Finance.Timesheets.Queries.GetTimesheet;

public class TimesheetDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public DateTime Date { get; set; }

    public Guid? TaskId { get; set; }
    public TimeSlotTaskDto? Task { get; set; }

    public List<TimeSlotDto> TimeSlots { get; set; } = new();

    public DateTime Created { get; set; }
    public DateTime? LastModified { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.TimeSheet, TimesheetDto>()
                .ForMember(dest => dest.Created, opt => opt.MapFrom(src => src.Created.DateTime))
                .ForMember(dest => dest.LastModified, opt => opt.MapFrom(src => src.LastModified.DateTime))
                .ForMember(dest => dest.Task, opt => opt.MapFrom(src => src.Task))
                .ForMember(dest => dest.TimeSlots, opt => opt.MapFrom(src => src.TimeSlots));
        }
    }
}

public class TimeSlotTaskDto
{
    public Guid Id { get; set; }
    public string? Code { get; set; }
    public long Serial { get; set; }
    public string? Description { get; set; }
    public Guid? ProjectId { get; set; }
    public ProjectType? Type { get; set; } = null;
    public Guid? MileStoneId { get; set; }
    public Guid? ClientId { get; set; }
    public Guid? ClientLeadId { get; set; }
    public Guid? VendorId { get; set; }
    public Guid? VendorContractId { get; set; }
    public Guid? DocumentId { get; set; }
    public Guid StatusId { get; set; }
    public Guid? CategoryId { get; set; }
    public Guid? PriorityId { get; set; }
    public Guid? ParentTaskId { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.ProjectTask, TimeSlotTaskDto>()
                .ForMember(dest => dest.Type,
                    opt => opt.MapFrom(src => src.Project != null ? src.Project.Type : (ProjectType?)null));
        }
    }
}

public class TimeSlotDto
{
    public Guid Id { get; set; }
    public DateTime StartTime { get; set; }
    public double DurationInMinutes { get; set; }
    public string? Description { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.TimeSlot, TimeSlotDto>()
                .ForMember(dest => dest.DurationInMinutes, opt => opt.MapFrom(src => src.Duration.TotalMinutes));
        }
    }
}
