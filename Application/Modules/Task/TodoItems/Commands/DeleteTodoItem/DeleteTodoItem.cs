

using Finbuckle.MultiTenant.Abstractions;
using Microsoft.Extensions.Logging;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Tasks.TodoItems.Commands.DeleteTodoItem;

public record DeleteTodoItemCommand : IRequest<Result<DeleteTodoItemResponse>>
{
    public Guid Id { get; set; }
    public List<Guid?> MembersIds { get; set; } = new();
}

public class DeleteTodoItemResponse
{
}

public class DeleteTodoItemCommandValidator : AbstractValidator<DeleteTodoItemCommand>
{
    public DeleteTodoItemCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.TodoItem>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("TodoItem not found.");
    }
}

public class DeleteTodoItemCommandHandler : IRequestHandler<DeleteTodoItemCommand, Result<DeleteTodoItemResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly SendEmailAndNotificationService _sendEmailAndNotificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;

private readonly ILogger<DeleteTodoItemCommandHandler> _logger;
    public DeleteTodoItemCommandHandler(ITenantDbContext context, 
    IMapper mapper, IUser user, SendEmailAndNotificationService sendEmailAndNotificationService, 
    IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor, ILogger<DeleteTodoItemCommandHandler> logger )  
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;
        _logger = logger;
    }

    public async Task<Result<DeleteTodoItemResponse>> Handle(DeleteTodoItemCommand request, CancellationToken cancellationToken)
    {
        var todoItem = await _context.GetSet<Novologs.Domain.Entities.TodoItem>().FindAsync(request.Id);
        if (todoItem == null)
        {
            return Result<DeleteTodoItemResponse>.Failure("TodoItem_002", "TodoItem not found.");
        }

        _context.GetSet<Novologs.Domain.Entities.TodoItem>().Remove(todoItem);
        await _context.SaveChangesAsync(cancellationToken);

        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        var members = await _context.GetSet<TenantUser>().Where(m => request.MembersIds.Contains(m.Id))
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
                Subject = $"Todo Item has been deleted: {todoItem.Content}",
                Message = $"The todo item '{todoItem.Content}' has been deleted.",
                Data = new Dictionary<string, string>()
            };
            emailData.Data.Add("TodoItemContent", todoItem.Content ?? "");
            emailData.Data.Add("TodoItemId", todoItem.Id.ToString());
            _sendEmailAndNotificationService.SendEmail(emailData);
            _logger.LogInformation("Email sent for Todo Item Deleted: {TodoItemContent}", todoItem.Content);

            var notificationData = new NotificationData()
            {
                TenantId = tenantInfo?.Id,
                UserIds = members.Select(m => m.Id).ToList(),
                Type = NotificationType.AssignedTodoItem,
                Title = $"Todo Item Deleted",
                Body = $"The todo item '{todoItem.Content}' has been deleted.",
                Data = new Dictionary<string, string>() { { "TodoItemId", todoItem.Id.ToString() } }
            };
            _sendEmailAndNotificationService.SendNotification(notificationData);
            _logger.LogInformation("Notification sent for Todo Item Deleted: {TodoItemContent}", todoItem.Content);
        }
        return Result<DeleteTodoItemResponse>.Success(new DeleteTodoItemResponse());
    }
}
