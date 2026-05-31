using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Tasks.TodoItems.Queries.GetTodoItem;

public record GetTodoItemQuery : IRequest<Result<GetTodoItemResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
    public Guid? LeadUpdateId { get; set; }
}

public class GetTodoItemResponse : FilteredResult<TodoItemDto>
{
}

public class TodoItemDto
{
    public Guid Id { get; set; }
    public string Content { get; set; } = null!;
    public DateTime? ReminderDateTime { get; set; }
    public Novologs.Domain.Enums.TodoStatus Status { get; set; }
    public Guid? PriorityId { get; set; }
    public DateTimeOffset? Created { get; set; }
    public DateTimeOffset? LastModified { get; set; }

    public List<TodoItemMemberDto> Members { get; set; } = new();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.TodoItem, TodoItemDto>()
                .ForMember(dest => dest.Members, opt => opt.MapFrom(src => src.Members))
                .ForMember(dest => dest.Status,
                    opt => opt.MapFrom(src => src.Members.FirstOrDefault(m => m.IsOwner)!.Status))
                ;
        }
    }
}

public class TodoItemMemberDto
{
    public Guid MemberId { get; set; }
    public bool IsOwner { get; set; }
    public string? MemberName { get; set; }
    public string? MemberEmail { get; set; }

    public LocalizableTextDto? Designation { get; set; }
    public LocalizableTextDto? Department { get; set; }
    public string? ProfileImageFileUrl { get; set; }
    public string? MemberProfileImageFileUrl { get; set; }
    public Novologs.Domain.Enums.TodoStatus Status { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.TodoItemMember, TodoItemMemberDto>()
                .ForMember(dest => dest.MemberName, opt => opt.MapFrom(src => src.Member!.FullName))
                .ForMember(dest => dest.MemberEmail, opt => opt.MapFrom(src => src.Member!.Email))
                .ForMember(dest => dest.Designation,
                    opt => opt.MapFrom(src => src.Member!.Designation!.Name))
                .ForMember(dest => dest.Department,
                    opt => opt.MapFrom(src => src.Member!.Department!.Name))
                .ForMember(dest => dest.MemberProfileImageFileUrl,
                    opt => opt.MapFrom(src => src.Member!.ProfileImageFile != null
                        ? src.Member.ProfileImageFile.Url
                        : null))
                ;
        }
    }
}

public class GetTodoItemQueryValidator : AbstractValidator<GetTodoItemQuery>
{
    public GetTodoItemQueryValidator()
    {
    }
}

public class GetTodoItemQueryHandler : IRequestHandler<GetTodoItemQuery, Result<GetTodoItemResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public GetTodoItemQueryHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<GetTodoItemResponse>> Handle(GetTodoItemQuery request, CancellationToken cancellationToken)
    {
        var result = new GetTodoItemResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.TodoItem>("")
            .Include(t => t.Members)
            .AsSplitQuery()
            .AsNoTracking();

        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<GetTodoItemResponse>.Failure("TodoItem_004", "User not found.");
        }

        query = query.Where(t =>
            t.Members.Any(m => m.MemberId == userId) ||
            (t.TaskId != null && t.Task!.CreatorId == userId)
        );

        if (request.LeadUpdateId.HasValue)
            query = query.Where(t => t.LeadUpdateId == request.LeadUpdateId.Value);

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<TodoItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetTodoItemResponse>.Success(result);
    }
}
