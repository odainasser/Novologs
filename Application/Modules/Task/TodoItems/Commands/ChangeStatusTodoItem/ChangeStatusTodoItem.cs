using Finbuckle.MultiTenant.Abstractions;
using Microsoft.Extensions.Logging;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Tasks.TodoItems.Commands.ChangeStatusTodoItem;

public record ChangeStatusTodoItemCommand : IRequest<Result<ChangeStatusTodoItemResponse>>
{
    public Guid Id { get; set; }
    public Novologs.Domain.Enums.TodoStatus Status { get; set; }
     public List<Guid> MemberIds { get; set; } = new();

}

public class ChangeStatusTodoItemResponse
{
}

public class ChangeStatusTodoItemCommandValidator : AbstractValidator<ChangeStatusTodoItemCommand>
{
    public ChangeStatusTodoItemCommandValidator(ITenantDbContext context, IUser user)
    {
    
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.TodoItem>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("TodoItem not found.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                if (!Guid.TryParse(user.Id, out var userId)) return false;
                return await context.GetSet<Novologs.Domain.Entities.TodoItemMember>()
                    .AnyAsync(m => m.TodoId == id && m.MemberId == userId, cancellationToken);
            }).WithMessage("Only members can change the status of the TodoItem.");
    }
}

public class
    ChangeStatusTodoItemCommandHandler : IRequestHandler<ChangeStatusTodoItemCommand,
    Result<ChangeStatusTodoItemResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
        private readonly SendEmailAndNotificationService _sendEmailAndNotificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;
    private readonly ILogger<ChangeStatusTodoItemCommandHandler> _logger;

    public ChangeStatusTodoItemCommandHandler(ITenantDbContext context, 
    IMapper mapper, IUser user, SendEmailAndNotificationService sendEmailAndNotificationService, 
    IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor, ILogger<ChangeStatusTodoItemCommandHandler> logger   )
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
        _logger = logger;
    }

    public async Task<Result<ChangeStatusTodoItemResponse>> Handle(ChangeStatusTodoItemCommand request,
        CancellationToken cancellationToken)
    {
        var todoItem = await _context.GetSet<Novologs.Domain.Entities.TodoItem>()
            .Include(t => t.Members)
            .FirstAsync(t => t.Id == request.Id);
        if (todoItem == null)
        {
            return Result<ChangeStatusTodoItemResponse>.Failure("TodoItem_001", "TodoItem not found.");
        }

        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<ChangeStatusTodoItemResponse>.Failure("TodoItem_005", "User not found.");
        }

        var member = todoItem.Members.FirstOrDefault(m => m.MemberId == userId);
        if (member == null)
        {
            return Result<ChangeStatusTodoItemResponse>.Failure("TodoItem_006",
                "User is not a member of this TodoItem.");
        }

        member.Status = request.Status;
        await _context.SaveChangesAsync(cancellationToken);

        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        var members = await _context.GetSet<TenantUser>().Where(m => request.MemberIds.Contains(m.Id))
            .ToListAsync(cancellationToken);
            if (members.Any())
            {
                var emailData = new EmailData()
                {
                    TenantId = tenantInfo?.Id,
                    EmailTemplate = EmailTemplate.NotificationEmail,
                    UserInfo = members.Select(m => new EmailUserInfo() 
                    { 
                        Email = m.Email!, 
                        FirstName = m.FullName, 
                        Id = m.Id 
                    }).ToList(),
                    Subject = $"Todo Item Status Changed: {todoItem.Content}",
                    Message = $"The status of todo item '{todoItem.Content}' has been changed to {request.Status}.",
                    Data = new Dictionary<string, string>()
                };
                emailData.Data.Add("TodoItemContent", todoItem.Content ?? "");
                emailData.Data.Add("TodoItemId", todoItem.Id.ToString());
                _sendEmailAndNotificationService.SendEmail(emailData);
                _logger.LogInformation("Email sent for Todo Item Status Changed: {TodoItemContent}", todoItem.Content);

                
                var notificationData = new NotificationData()
                {
                    TenantId = tenantInfo?.Id,
                    UserIds = members.Select(m => m.Id).ToList(),
                    Type = NotificationType.AssignedTodoItem,
                    Title = $"Todo Item Status Changed",
                    Body = $"The status of todo item '{todoItem.Content}' has been changed to {request.Status}.",
                    Data = new Dictionary<string, string>() { { "TodoItemId", todoItem.Id.ToString() } }
                };
                _sendEmailAndNotificationService.SendNotification(notificationData);
                _logger.LogInformation("Notification sent for Todo Item Status Changed: {TodoItemContent}", todoItem.Content);
            }

        return Result<ChangeStatusTodoItemResponse>.Success(new ChangeStatusTodoItemResponse());
    }
}
