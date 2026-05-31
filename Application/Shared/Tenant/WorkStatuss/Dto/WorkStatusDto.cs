using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.WorkStatuss.Dto;

public class WorkStatusDto
{
    public Guid Id { get; set; }
    public LocalizableTextDto? Name { get; set; }
    public bool IsActive { get; set; }
    public string? Color { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Domain.Entities.WorkStatus, WorkStatusDto>();
        }
    }
}

public class UserWorkStatusDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid WorkStatusId { get; set; }
    public WorkStatusDto? WorkStatus { get; set; }
    public DateTimeOffset StartDate { get; set; }
    public DateTimeOffset? EndDate { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Domain.Entities.UserWorkStatus, UserWorkStatusDto>();
        }
    }
}

