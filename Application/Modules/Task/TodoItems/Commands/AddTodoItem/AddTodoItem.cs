using Finbuckle.MultiTenant.Abstractions;
using MessageTemplates.Services;
using Microsoft.Extensions.Logging;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;
using SystemLoaders.Services;
using Novologs.Application.Common.Helpers;

namespace Novologs.Application.Modules.Tasks.TodoItems.Commands.AddTodoItem;

public record AddTodoItemCommand : IRequest<Result<AddTodoItemResponse>>
{
    public string Content { get; set; } = null!;
    public DateTime? ReminderDateTime { get; set; }
    public List<Guid> MemberIds { get; set; } = new();
    public Guid? TaskId { get; set; }
    public Guid? LeadUpdateId { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddTodoItemCommand, Novologs.Domain.Entities.TodoItem>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()))
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Content))
                .ForMember(dest => dest.ReminderDateTime, opt => opt.MapFrom(src => src.ReminderDateTime))
                .ForMember(dest => dest.LeadUpdateId, opt => opt.MapFrom(src => src.LeadUpdateId))
                .ForMember(dest => dest.Members, opt => opt.Ignore());
        }
    }
}

public class AddTodoItemResponse
{
    public Guid Id { get; set; }
}

public class AddTodoItemCommandValidator : AbstractValidator<AddTodoItemCommand>
{
    public AddTodoItemCommandValidator(ITenantDbContext context)
    {

        RuleFor(v => v.Content)
            .NotEmpty().WithMessage("Content is required.")
            .MaximumLength(500).WithMessage("Content must not exceed 500 characters.");

        RuleForEach(v => v.MemberIds)
            .MustAsync(async (memberId, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.TenantUser>()
                    .AnyAsync(u => u.Id == memberId, cancellationToken);
            }).WithMessage("One or more members not found.");

        RuleFor(v => v.MemberIds)
            .Must(members => members.Distinct().Count() == members.Count)
            .WithMessage("Duplicate members are not allowed.");

        RuleFor(v => v.LeadUpdateId)
            .MustAsync(async (leadUpdateId, cancellationToken) =>
            {
                if (!leadUpdateId.HasValue) return true;
                return await context.GetSet<Novologs.Domain.Entities.LeadUpdate>()
                    .AnyAsync(lu => lu.Id == leadUpdateId, cancellationToken);
            }).WithMessage("LeadUpdate not found.");
    }
}

public class AddTodoItemCommandHandler : IRequestHandler<AddTodoItemCommand, Result<AddTodoItemResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly INotificationService _notificationService;
    private readonly SendEmailAndNotificationService _sendEmailAndNotificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;
    private readonly ILogger<AddTodoItemCommandHandler> _logger;
    
    public AddTodoItemCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        IUser user,
        INotificationService notificationService,
        SendEmailAndNotificationService sendEmailAndNotificationService,
        IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor,
        ILogger<AddTodoItemCommandHandler> logger
    )
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _notificationService = notificationService;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
        _logger = logger;
    }

    public async Task<Result<AddTodoItemResponse>> Handle(AddTodoItemCommand request,
        CancellationToken cancellationToken)
    {
        var todoItem = _mapper.Map<Novologs.Domain.Entities.TodoItem>(request);
        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<AddTodoItemResponse>.Failure("TodoItem_001", "User not found.");
        }

        if (!request.MemberIds.Contains(userId))
        {
            request.MemberIds.Add(userId);
        }

        foreach (var memberId in request.MemberIds)
        {
            todoItem.Members.Add(new Novologs.Domain.Entities.TodoItemMember(Guid.NewGuid())
            {
                TodoId = todoItem.Id, MemberId = memberId, IsOwner = memberId == userId
            });
        }

        await _context.GetSet<Novologs.Domain.Entities.TodoItem>().AddAsync(todoItem, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;

        var otherMembersIds = request.MemberIds.Where(id => id != userId).ToList();

        if (otherMembersIds.Any())
        {
            await _notificationService.SendNotificationWithUserLanguages(
                _context,
                MessageType.TodoItemCreated,
                tenantInfo?.Id,
                otherMembersIds,
                new
                {
                    TodoItemContent = todoItem.Content ?? "",
                    TodoItemId = todoItem.Id.ToString(),
                    TaskId = todoItem.TaskId?.ToString() ?? ""
                },
                cancellationToken);
            _logger.LogInformation("Notification sent for Todo Item Created: {TodoItemContent}", todoItem.Content);
        }

        if (request.ReminderDateTime.HasValue)
        {
            var reminderTemplateData = new Dictionary<string, string>
            {
                { "TodoItemContent", todoItem.Content ?? "" },
                { "TodoItemId", todoItem.Id.ToString() },
                { "TaskId", todoItem.TaskId?.ToString() ?? "" }
            };
            _sendEmailAndNotificationService.SendNotification(
                new NotificationData()
                {
                    TenantId = tenantInfo?.Id,
                    UserIds = request.MemberIds,
                    Type = NotificationType.TodoItemReminder,
                    Title = "",
                    Body = "",
                    MessageType = MessageType.TodoItemReminder,
                    TemplateData = reminderTemplateData,
                    Data = reminderTemplateData
                }, request.ReminderDateTime.Value);
            _logger.LogInformation("Reminder set for Todo Item: {TodoItemContent} at {ReminderDateTime}", todoItem.Content, request.ReminderDateTime.Value);
        }

        return Result<AddTodoItemResponse>.Success(new AddTodoItemResponse { Id = todoItem.Id });
    }
}
