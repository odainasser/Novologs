namespace Novologs.Application.Modules.Finance.Timesheets.Commands.AddTimesheet;

public class AddTimeSlotDto
{
    public DateTime StartTime { get; set; }
    public decimal DurationInMinutes { get; set; }
    public string? Description { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddTimeSlotDto, Novologs.Domain.Entities.TimeSlot>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.Duration,
                    opt => opt.MapFrom(src => TimeSpan.FromMinutes((double)src.DurationInMinutes)));
        }
    }
} 
public class UpdateTimeSlotDto : AddTimeSlotDto
{
    public Guid Id { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateTimeSlotDto, Novologs.Domain.Entities.TimeSlot>();
        }
    }
}

