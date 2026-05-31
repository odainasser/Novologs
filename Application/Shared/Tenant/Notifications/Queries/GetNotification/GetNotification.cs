using MessageTemplates.Services;
using Microsoft.AspNetCore.Http;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using SystemLoaders.Services;
using Novologs.Domain.Enums;

namespace Novologs.Application.Notifications.Queries.GetNotification;

public record GetNotificationQuery : IRequest<Result<GetNotificationResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
}

public class GetNotificationResponse : FilteredResult<NotificationDto>
{
    public int UnreadCount { get; set; }
}

public class NotificationDto
{
    public Guid Id { get; set; }
    public Guid? TenantId { get; set; }
    public Guid? UserId { get; set; }
    public string Title { get; set; } = null!;
    public string Body { get; set; } = null!;
    public NotificationType Type { get; set; }
    public Dictionary<string, string>? Data { get; set; }
    public bool IsRead { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Domain.Entities.Notification, NotificationDto>();
        }
    }
}

public class GetNotificationQueryValidator : AbstractValidator<GetNotificationQuery>
{
    public GetNotificationQueryValidator(ITenantDbContext context, IUser user)
    {
    }
}

public class GetNotificationQueryHandler : IRequestHandler<GetNotificationQuery, Result<GetNotificationResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly IMapper _mapper;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IMessageTemplateService _messageTemplateService;

    public GetNotificationQueryHandler(
        ITenantDbContext context, 
        IUser user, 
        IMapper mapper,
        IHttpContextAccessor httpContextAccessor,
        IMessageTemplateService messageTemplateService)
    {
        _context = context;
        _user = user;
        _mapper = mapper;
        _httpContextAccessor = httpContextAccessor;
        _messageTemplateService = messageTemplateService;
    }

    public async Task<Result<GetNotificationResponse>> Handle(GetNotificationQuery request,
        CancellationToken cancellationToken)
    {
        // Hybrid approach: Try x-language header first, then user's profile, finally default to "en"
        var language = _httpContextAccessor.HttpContext?.Request.Headers["x-language"].ToString();

        if (string.IsNullOrWhiteSpace(language))
        {
            // Fallback to user's profile language preference
            var userLanguage = await _context.GetSet<Domain.Entities.TenantUser>()
                .Where(u => u.Id == _user.IdGuid)
                .Select(u => u.Language)
                .FirstOrDefaultAsync(cancellationToken);
            
            language = !string.IsNullOrWhiteSpace(userLanguage) ? userLanguage : "en";
        }

        var result = new GetNotificationResponse();
        var query = _context.GetSet<Domain.Entities.Notification>()
            .Where(n => n.UserId == _user.IdGuid)
            .AsNoTracking();

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);
        result.UnreadCount = await query.CountAsync(n => !n.IsRead, cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        var notifications = await query.ToListAsync(cancellationToken);

        // Map notifications and apply localization for those with MessageType
        result.Items = notifications.Select(n =>
        {
            var dto = _mapper.Map<NotificationDto>(n);
            
            // If notification has MessageType and TemplateData, regenerate Title/Body based on language
            if (n.MessageType.HasValue && n.TemplateData != null)
            {
                dto.Title = _messageTemplateService.GetNotificationTitle(
                    n.MessageType.Value, 
                    language, 
                    n.TemplateData);
                dto.Body = _messageTemplateService.GetNotificationBody(
                    n.MessageType.Value, 
                    language, 
                    n.TemplateData);
            }
            // Otherwise, use the stored Title/Body (backward compatibility)
            
            return dto;
        }).ToList();

        return Result<GetNotificationResponse>.Success(result);
    }
}
