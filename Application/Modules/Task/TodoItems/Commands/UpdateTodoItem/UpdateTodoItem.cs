using Finbuckle.MultiTenant.Abstractions;
using Novologs.Domain.Entities;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;

namespace Novologs.Application.Modules.Tasks.TodoItems.Commands.UpdateTodoItem;

public record UpdateTodoItemCommand : IRequest<Result<UpdateTodoItemResponse>>
{
    public Guid Id { get; set; }
    public string? Content { get; set; }
    public DateTime? ReminderDateTime { get; set; }
    public List<Guid>? MemberIds { get; set; }
    public Guid? LeadUpdateId { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateTodoItemCommand, Novologs.Domain.Entities.TodoItem>()
                .ForMember(dest => dest.Content, opt => opt.MapFrom(src => src.Content))
                .ForMember(dest => dest.ReminderDateTime, opt => opt.MapFrom(src => src.ReminderDateTime))
                .ForMember(dest => dest.LeadUpdateId, opt => opt.Ignore())
                .ForMember(dest => dest.Members, opt => opt.Ignore());
        }
    }
}

public class UpdateTodoItemResponse
{
}

public class UpdateTodoItemCommandValidator : AbstractValidator<UpdateTodoItemCommand>
{
    public UpdateTodoItemCommandValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.TodoItem>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("TodoItem not found.");

        RuleFor(v => v.Content)
            .MaximumLength(500).WithMessage("Content must not exceed 500 characters.");

        RuleFor(v => v.MemberIds)
            .MustAsync(async (memberIds, cancellationToken) =>
            {
                if (memberIds == null || !memberIds.Any()) return true;
                var existingMembers = await context.GetSet<Novologs.Domain.Entities.TenantUser>()
                    .Where(u => memberIds.Contains(u.Id))
                    .Select(u => u.Id)
                    .ToListAsync(cancellationToken);
                return existingMembers.Count == memberIds.Count;
            }).WithMessage("One or more members not found.");
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                if (!Guid.TryParse(user.Id, out var userId)) return false;
                return await context.GetSet<Novologs.Domain.Entities.TodoItemMember>()
                    .AnyAsync(m => m.TodoId == id && m.MemberId == userId && m.IsOwner, cancellationToken);
            }).WithMessage("Only the owner can update the TodoItem.");
    }
}

public class UpdateTodoItemCommandHandler : IRequestHandler<UpdateTodoItemCommand, Result<UpdateTodoItemResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;
    private readonly SendEmailAndNotificationService _sendEmailAndNotificationService;

    public UpdateTodoItemCommandHandler(ITenantDbContext context, 
    IMapper mapper, IUser user, IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor,  
    SendEmailAndNotificationService sendEmailAndNotificationService)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _multiTenantContextAccessor = multiTenantContextAccessor;
        _sendEmailAndNotificationService = sendEmailAndNotificationService;
    }

    public async Task<Result<UpdateTodoItemResponse>> Handle(UpdateTodoItemCommand request,
        CancellationToken cancellationToken)
    {
        var todoItem = await _context.GetSet<Novologs.Domain.Entities.TodoItem>()
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (todoItem == null)
        {
            return Result<UpdateTodoItemResponse>.Failure("TodoItem_001", "TodoItem not found.");
        }

        _mapper.Map(request, todoItem);

        if (request.LeadUpdateId.HasValue)
            todoItem.LeadUpdateId = request.LeadUpdateId.Value;

        if (request.MemberIds != null)
        {
            var existingMemberIds = todoItem.Members.Select(m => m.MemberId).ToList();
            var membersToAdd = request.MemberIds.Except(existingMemberIds).ToList();
            var membersToRemove = existingMemberIds.Except(request.MemberIds).ToList();

            if (!Guid.TryParse(_user.Id, out var userId))
            {
                return Result<UpdateTodoItemResponse>.Failure("TodoItem_003", "User not found.");
            }

            foreach (var memberId in membersToAdd)
            {
                todoItem.Members.Add(new Novologs.Domain.Entities.TodoItemMember(Guid.NewGuid())
                {
                    TodoId = todoItem.Id, MemberId = memberId, IsOwner = memberId == userId
                });
            }

            foreach (var memberId in membersToRemove)
            {
                var memberToRemove = todoItem.Members.FirstOrDefault(m => m.MemberId == memberId);
                if (memberToRemove != null)
                {
                    todoItem.Members.Remove(memberToRemove);
                }
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        //send notifications here
        // if (request.MemberIds != null)
        // {
        //     var existingMemberIds = todoItem.Members.Select(m => m.MemberId).ToList();
        //     var membersToAdd = request.MemberIds.Except(existingMemberIds).ToList();
        //     var membersToRemove = existingMemberIds.Except(request.MemberIds).ToList();

        // var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;
        // //var members = await _context.GetSet<TenantUser>().Where(m => request.MemberIds.Contains(m.Id))
        //     //.ToListAsync(cancellationToken);
        //     if (membersToAdd.Any())
        //     {
        //         var emailData = new EmailData()
        //         {
        //             TenantId = tenantInfo?.Id,
        //             EmailTemplate = EmailTemplate.NotificationEmail,
        //             UserInfo = membersToAdd.Select(m => new EmailUserInfo() 
        //             { 
        //                 Email = m.Email!, 
        //                 FirstName = m.FullName, 
        //                 Id = m.Id 
        //             }).ToList(),
        //             Subject = $"Todo Item has been deleted: {todoItem.Content}",
        //             Message = $"The todo item '{todoItem.Content}' has been deleted.",
        //             Data = new Dictionary<string, string>()
        //         };
        //         emailData.Data.Add("TodoItemContent", todoItem.Content ?? "");
        //         emailData.Data.Add("TodoItemId", todoItem.Id.ToString());
        //         _sendEmailAndNotificationService.SendEmail(emailData);
                
        //         var notificationData = new NotificationData()
        //         {
        //             TenantId = tenantInfo?.Id,
        //             UserIds = members.Select(m => m.Id).ToList(),
        //             Type = NotificationType.AssignedTodoItem,
        //             Title = $"Todo Item Deleted",
        //             Body = $"The todo item '{todoItem.Content}' has been deleted.",
        //             Data = new Dictionary<string, string>() { { "TodoItemId", todoItem.Id.ToString() } }
        //         };
        //         _sendEmailAndNotificationService.SendNotification(notificationData);
        //     }
        // }
        return Result<UpdateTodoItemResponse>.Success(new UpdateTodoItemResponse());
    }
}
