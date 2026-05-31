using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using TaskStatus = Novologs.Domain.Entities.TaskStatus;

namespace Novologs.Application.Modules.Tasks.Tasks.Queries.GetTaskQuery;

public class GetTasksQueryValidator : AbstractValidator<GetTasksQuery>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetTasksQueryValidator(ITenantDbContext context, IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _user = user;
        _userManager = userManager;
        var currentUserId = Guid.Parse(_user.Id!);

        RuleFor(v => v)
            .Must(v => (short)v.CreatFilter <= 4 || (short)v.CreatFilter == 7 || v.ControlEntity != TaskControlEntity.None || v.MyEmployee == true ||
                       (v.UserIds != null && v.UserIds.Any()))
            .WithMessage(
                "At least one filter  must be specified:  " +
                "CreatFilter is in (MyCreated=0, MyAssigned=1, MyCreatedAndAssigned=2, MyBacklog=3, MyAll=4, All =7)," +
                " or ControlEntity is in (ParentTask=1, Project=2, Milestone=3, Client=4, ClientLead=5, Vendor=6, VendorContract=7)," +
                " or MyEmployee or UserIds.");


        RuleFor(v => v.ControlEntityId)
            .MustAsync(async (context, controlEntityId, cancellationToken) =>
            {
                if (controlEntityId == null || context.ControlEntity == TaskControlEntity.None) return true;

                switch (context.ControlEntity)
                {
                    case TaskControlEntity.ParentTask:
                        return await _context.GetSet<Novologs.Domain.Entities.ProjectTask>()
                            .AnyAsync(d => d.Id == controlEntityId, cancellationToken);
                    case TaskControlEntity.Project:
                        return await _context.GetSet<Novologs.Domain.Entities.Project>()
                            .AnyAsync(d => d.Id == controlEntityId, cancellationToken);
                    case TaskControlEntity.Milestone:
                        return await _context.GetSet<ProjectMileStone>()
                            .AnyAsync(d => d.Id == controlEntityId, cancellationToken);
                    case TaskControlEntity.Client:
                        return await _context.GetSet<Novologs.Domain.Entities.Client>()
                            .AnyAsync(d => d.Id == controlEntityId, cancellationToken);
                    case TaskControlEntity.ClientLead:
                        return await _context.GetSet<ClientLead>()
                            .AnyAsync(d => d.Id == controlEntityId, cancellationToken);
                    case TaskControlEntity.Vendor:
                        return await _context.GetSet<Novologs.Domain.Entities.Vendor>()
                            .AnyAsync(d => d.Id == controlEntityId, cancellationToken);
                    case TaskControlEntity.VendorContract:
                        return await _context.GetSet<VendorContract>()
                            .AnyAsync(d => d.Id == controlEntityId, cancellationToken);
                    default:
                        return false;
                }
            }).WithMessage("ControlEntityId is not valid."); 
        
        RuleFor(v => v.StatusIds)
            .MustAsync(async (statusIds, cancellationToken) =>
            {
                if (statusIds == null || !statusIds.Any()) return true;

                return await _context.GetSet<TaskStatus>()
                    .AnyAsync(d => statusIds.Contains(d.Id), cancellationToken);
            }).WithMessage("StatusIds is not valid.");

        RuleFor(v => v.CategoryId)
            .MustAsync(async (categoryIds, cancellationToken) =>
            {
                if (categoryIds == null || !categoryIds.Any()) return true;

                return await _context.GetSet<TaskCategory>()
                    .AnyAsync(d => categoryIds.Contains(d.Id), cancellationToken);
            }).WithMessage("CategoryId is not valid.");

        RuleFor(v => v.PriorityId)
            .MustAsync(async (priorityIds, cancellationToken) =>
            {
                if (priorityIds == null || !priorityIds.Any()) return true;

                return await _context.GetSet<TaskPriority>()
                    .AnyAsync(d => priorityIds.Contains(d.Id), cancellationToken);
            }).WithMessage("PriorityId is not valid.");
    }
}
