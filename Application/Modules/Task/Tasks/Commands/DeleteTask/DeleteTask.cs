using MessageTemplates.Services;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Domain.Enums;
using Novologs.Application.Common.Helpers;
using Novologs.Domain.Entities;
using Finbuckle.MultiTenant.Abstractions;
using Microsoft.Extensions.Logging;

namespace Novologs.Application.Modules.Tasks.Tasks.Commands.DeleteTask;

public record DeleteTaskCommand : IRequest<Result<DeleteTaskResponse>>
{
    public Guid Id { get; set; }
      public List<Guid?> MembersIds { get; set; } = new();
}

public class DeleteTaskResponse
{
}

public class DeleteTaskCommandHandler : IRequestHandler<DeleteTaskCommand, Result<DeleteTaskResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly INotificationService _notificationService;
    private readonly IMultiTenantContextAccessor<AppTenantInfo> _multiTenantContextAccessor;

    private readonly ILogger<DeleteTaskCommandHandler> _logger;
    
    public DeleteTaskCommandHandler(ITenantDbContext context, IUser user, 
    INotificationService notificationService, 
    IMultiTenantContextAccessor<AppTenantInfo> multiTenantContextAccessor,
    ILogger<DeleteTaskCommandHandler> logger)
    {
        _context = context;
        _user = user;
        _notificationService = notificationService;
        _multiTenantContextAccessor = multiTenantContextAccessor;   
        _logger = logger;
    }

    public async Task<Result<DeleteTaskResponse>> Handle(DeleteTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await _context.GetSet<Novologs.Domain.Entities.ProjectTask>()
            .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken);
        if (task == null)
        {
            return Result<DeleteTaskResponse>.Failure(new[] { new ErrorItem("Task_002", "Task not found") });
        }

        // Load member IDs before deletion using a lightweight query (no navigation property includes)
        var memberIds = await _context.GetSet<ProjectTaskMember>()
            .Where(m => m.TaskId == request.Id && m.MemberId != null)
            .Select(m => m.MemberId!.Value)
            .ToListAsync(cancellationToken);

        //TODO discuss ticket deletion (maybe some tage or status)
        _context.GetSet<Novologs.Domain.Entities.ProjectTaskTimeLine>().Add(new()
        {
            ProjectTaskId = task.Id,
            CreatorId = Guid.Parse(_user.Id!),
            Description = "Task Deleted",
            Date = DateTime.UtcNow
        });

        //TODO files deletion
        //TODO many constraints on deletion
        _context.GetSet<Novologs.Domain.Entities.ProjectTask>().Remove(task);
        await _context.SaveChangesAsync(cancellationToken);

        // Notify all members that were assigned to the deleted task
        var tenantInfo = _multiTenantContextAccessor?.MultiTenantContext?.TenantInfo;

        if (memberIds.Any())
        {
            _logger.LogInformation("Task Deleted {TaskSerial} - {TaskCode}", task.Serial, task.Code);

            await _notificationService.SendNotificationWithUserLanguages(
                _context,
                MessageType.TaskDeleted,
                tenantInfo?.Id,
                memberIds,
                new
                {
                    TaskSerial = task.Serial.ToString(),
                    TaskId = task.Id.ToString(),
                    TaskCode = task.Code ?? ""
                },
                cancellationToken);

            _logger.LogInformation("Notification sent for Task Deleted {TaskSerial} - {TaskCode}", task.Serial, task.Code);
        }

        return Result<DeleteTaskResponse>.Success(new DeleteTaskResponse());
    }
}
