using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Novologs.Application.Modules.Tasks.Tasks.Commands.UpdateTask;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Tasks.Tasks.Commands.CreateTask;

public class TaskMembersResolver : IValueResolver<CreateTaskCommand, ProjectTask, List<ProjectTaskMember>>
{
    private readonly ITenantDbContext _context;
    private readonly IUser _user;

    public TaskMembersResolver(
        ITenantDbContext context,
        IUser user
    )
    {
        _context = context;
        _user = user;
    }

    public List<ProjectTaskMember> Resolve(CreateTaskCommand src, ProjectTask dest,
        List<ProjectTaskMember> destMember, ResolutionContext context)
    {
        var NotStartedStatusId = (_context.GetSet<Novologs.Domain.Entities.TaskStatus>()
            .FirstOrDefault(d => d.Status == ProjectTaskStatus.NotStarted))!.Id;
        dest.Members = src.MembersIds
            .Select(memberId =>
                new ProjectTaskMember(Guid.NewGuid()) { MemberId = memberId, StatusId = NotStartedStatusId }).ToList();
        if (src.IsAssignedToMe)
        {
            if (_user.Id != null)
            {
                dest.Members.Add(new ProjectTaskMember(Guid.NewGuid())
                {
                    MemberId = _user.IdGuid, StatusId = NotStartedStatusId
                });
            }
        }

        return dest.Members;
    }
}
