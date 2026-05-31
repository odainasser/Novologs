using Novologs.Application.Common.Interfaces;
using Novologs.Application.Modules.Tasks.TodoItems.Queries.GetTodoItem;
using Novologs.Application.Designations.DTOs;
using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Tasks.Tasks.Dto;

public class ProjectTaskDto
{
    public Guid? Id { get; set; }
    public string? Code { get; set; }
    public long? Serial { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public DateTime? ActualStartDate { get; set; }
    public DateTime? ActualEndDate { get; set; }

    public Guid? ProjectId { get; set; }
    public ProjectType? Type { get; set; } = null;
    public string? ProjectName { get; set; }

    public Guid? MileStoneId { get; set; }
    public string? MileStoneName { get; set; }

    public Guid? ClientId { get; set; }
    public string? ClientName { get; set; }

    public Guid? ClientLeadId { get; set; }
    public string? ClientLeadName { get; set; }

    public Guid? VendorId { get; set; }
    public string? VendorName { get; set; }

    public Guid? VendorContractId { get; set; }
    public string? VendorContractName { get; set; }

    public Guid? CommentThreadId { get; set; }

    public int CommentCount { get; set; }

    public Guid? StatusId { get; set; }
    public LocalizableTextDto? StatusName { get; set; }
    public string? StatusColor { get; set; }

    public Guid? CategoryId { get; set; }
    public LocalizableTextDto? CategoryName { get; set; }

    public Guid? PriorityId { get; set; }
    public LocalizableTextDto? PriorityName { get; set; }
    public Guid? DocumentId { get; set; }

    public Guid? ParentTaskId { get; set; }
    public long? ParentTaskSerial { get; set; }

    public Guid CreatorId { get; set; }
    public string? CreatorName { get; set; }
    public string? CreatorProfileImageFileUrl { get; set; }
    public LocalizableTextDto? Designation { get; set; }
    public string? Color { get; set; }

    public bool IsConfidential { get; set; }
    public int ChildTaskCount { get; set; }

    public int TodoCount { get; set; }

    public decimal? Cost { get; set; }
    public TimeSpan Duration { get; set; }

    public Guid? AudioFileId { get; set; }
    public string? AudioFileUrl { get; set; }

    public Guid? RootFolderId { get; set; }

    public bool? IsOverdue{ get; set; } 
    public bool? IsLate{ get; set; }  
    public List<ProjectTaskMemberDto> Members { get; set; } = new();
    public List<TodoItemDto> TodoItems { get; set; } = new();

    public List<ProjectTaskTimeLineDto> TimeLines { get; set; } = new();

    public DateTimeOffset Created { get; set; }
    public string? CreatedBy { get; set; }
    public DateTimeOffset LastModified { get; set; }
    public string? LastModifiedBy { get; set; }

    public class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<ProjectTask, ProjectTaskDto>()
                .ForMember(dest => dest.ProjectName,
                    opt => opt.MapFrom(src => src.Project != null ? src.Project.Name : null))
                .ForMember(dest => dest.MileStoneName,
                    opt => opt.MapFrom(src => src.MileStone != null ? src.MileStone.Name : null))
                .ForMember(dest => dest.ClientName,
                    opt => opt.MapFrom(src => src.Client != null ? src.Client.Name : null))
                .ForMember(dest => dest.ClientLeadName,
                    opt => opt.MapFrom(src => src.ClientLead != null ? src.ClientLead.Name : null))
                .ForMember(dest => dest.VendorName,
                    opt => opt.MapFrom(src => src.Vendor != null ? src.Vendor.Name : null))
                .ForMember(dest => dest.VendorContractName,
                    opt => opt.MapFrom(src => src.VendorContract != null ? src.VendorContract.Name : null))
                .ForMember(dest => dest.StatusName,
                    opt => opt.MapFrom(src => src.Status != null ? src.Status.Name : null))
                .ForMember(dest => dest.StatusColor,
                    opt => opt.MapFrom(src => src.Status != null ? src.Status.Color : null))
                .ForMember(dest => dest.CategoryName,
                    opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null))
                .ForMember(dest => dest.PriorityName,
                    opt => opt.MapFrom(src => src.Priority != null ? src.Priority.Name : null))
                .ForMember(dest => dest.ParentTaskSerial,
                    opt => opt.MapFrom(src => src.ParentTask != null ? src.ParentTask.Serial : (long?)null))
                .ForMember(dest => dest.CreatorName,
                    opt => opt.MapFrom(src => src.Creator != null ? src.Creator.FullName : null))
                .ForMember(dest => dest.CreatorProfileImageFileUrl,
                    opt => opt.MapFrom(src => src.Creator!.ProfileImageFile != null
                        ? src.Creator.ProfileImageFile.Url
                        : null))
                .ForMember(dest => dest.Designation,
                    opt => opt.MapFrom(src => src.Creator!.Designation!.Name))
                .ForMember(dest => dest.Members, opt => opt.MapFrom(src => src.Members))
                .ForMember(dest => dest.Type,
                    opt => opt.MapFrom(src => src.Project != null ? src.Project.Type : (ProjectType?)null))
                .ForMember(dest => dest.Color,
                    opt => opt.MapFrom(src => src.Project != null ? src.Project.Color : null))
                .ForMember(dest => dest.ChildTaskCount, opt => opt.MapFrom(src => src.ChildTasks.Count))
                .ForMember(dest => dest.TodoItems, opt => opt.MapFrom(src => src.TodoItems))
                .ForMember(dest => dest.TimeLines, opt => opt.MapFrom(src => src.TimeLines))
                .ForMember(dest => dest.AudioFileUrl,
                    opt => opt.MapFrom(src => src.AudioFile != null ? src.AudioFile.Url : null))
                .ForMember(dest => dest.TodoCount, opt => opt.MapFrom<TodoCountResolver>())
                .ForMember(dest => dest.CommentCount, opt => opt.MapFrom<CommentCountResolver>())
                .ForMember(dest => dest.IsOverdue,
                    opt => opt.MapFrom(src =>
                        src.Status != null && src.Status.Status != Novologs.Domain.Enums.ProjectTaskStatus.Completed &&
                        src.EndDate.HasValue && src.EndDate.Value.Date < DateTime.UtcNow.Date))
                .ForMember(dest => dest.IsLate,
                    opt => opt.MapFrom(src =>
                        src.Status != null && src.Status.Status == Novologs.Domain.Enums.ProjectTaskStatus.Completed &&
                        src.ActualEndDate.HasValue && src.EndDate.HasValue &&
                        src.ActualEndDate.Value.Date > src.EndDate.Value.Date))
                ;
            
        }
    }
}

public class ProjectTaskTimeLineDto
{
    public Guid? Id { get; set; }
    public Guid ProjectTaskId { get; set; }
    public Guid CreatorId { get; set; }
    public string? CreatorName { get; set; }
    public string? CreatorProfileImageFileUrl { get; set; }
    public LocalizableTextDto? Designation { get; set; }
    public LocalizableTextDto? Department { get; set; }

    public string Description { get; set; } = null!;
    public DateTime? Date { get; set; }

    public class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<ProjectTaskTimeLine, ProjectTaskTimeLineDto>()
                .ForMember(dest => dest.CreatorName,
                    opt => opt.MapFrom(src => src.Creator != null ? src.Creator.FullName : null))
                .ForMember(dest => dest.CreatorProfileImageFileUrl,
                    opt => opt.MapFrom(src => src.Creator!.ProfileImageFile != null
                        ? src.Creator.ProfileImageFile.Url
                        : null))
                .ForMember(dest => dest.Designation,
                    opt => opt.MapFrom(src => src.Creator!.Designation!.Name))
                .ForMember(dest => dest.Department,
                    opt => opt.MapFrom(src => src.Creator!.Department!.Name))
                ;
        }
    }
}

public class TodoCountResolver : IValueResolver<ProjectTask, ProjectTaskDto, int>
{
    private readonly IUser _currentUser;

    public TodoCountResolver(IUser currentUser)
    {
        _currentUser = currentUser;
    }

    public int Resolve(ProjectTask source, ProjectTaskDto destination, int destMember, ResolutionContext context)
    {
        var userId = _currentUser.IdGuid;
        return source.TodoItems.Count(t => t.Members.Any(m => m.MemberId == userId));
    }
}
