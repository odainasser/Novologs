using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Finance.Timesheets.Commands.AddTimesheet;

public class AddTimesheetResponse
{
    public Guid Id { get; set; }
}

public record AddTimesheetCommand : IRequest<Result<AddTimesheetResponse>>
{
    public Guid TaskId { get; set; }
    public DateTime Date { get; set; }
    public List<AddTimeSlotDto> TimeSlots { get; set; } = new();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddTimesheetCommand, Novologs.Domain.Entities.TimeSheet>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.TimeSlots, opt => opt.MapFrom(src => src.TimeSlots));
        }
    }
}

public class AddTimesheetCommandHandler : IRequestHandler<AddTimesheetCommand, Result<AddTimesheetResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public AddTimesheetCommandHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<AddTimesheetResponse>> Handle(AddTimesheetCommand request,
        CancellationToken cancellationToken)
    {
        var timesheet = _mapper.Map<Novologs.Domain.Entities.TimeSheet>(request);

        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<AddTimesheetResponse>.Failure("Timesheet_001", "User not found.");
        }

        timesheet.UserId = userId;

        await _context.GetSet<Novologs.Domain.Entities.TimeSheet>().AddAsync(timesheet, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<AddTimesheetResponse>.Success(new AddTimesheetResponse { Id = timesheet.Id });
    }
}
