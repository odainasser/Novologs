using System.ComponentModel;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.User.Dto;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Project.Projects.Queries.GetProjectStatistics;

[Description(
    "Retrieves statistics for a specific project, including task counts by status and user-specific task statistics.")]
public record GetProjectStatisticsQuery : IRequest<Result<GetProjectStatisticsResponse>>
{
    [Description("The ID of the project for which to retrieve statistics.")]
    public Guid ProjectId { get; set; }
}

public class GetProjectStatisticsQueryValidator : AbstractValidator<GetProjectStatisticsQuery>
{
    public GetProjectStatisticsQueryValidator(ITenantDbContext context)
    {
        RuleFor(v => v.ProjectId)
            .NotEmpty().WithMessage("ProjectId is required.")
            .MustAsync(async (projectId, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.Project>()
                    .AnyAsync(p => p.Id == projectId, cancellationToken);
            }).WithMessage("ProjectId is not valid.");
    }
}

public class
    GetProjectStatisticsQueryHandler : IRequestHandler<GetProjectStatisticsQuery, Result<GetProjectStatisticsResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetProjectStatisticsQueryHandler(
        ITenantDbContext context,
        IMapper mapper,
        IUser user,
        UserManager<TenantUser> userManager
    )
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _userManager = userManager;
    }

    public async Task<Result<GetProjectStatisticsResponse>> Handle(GetProjectStatisticsQuery request,
        CancellationToken cancellationToken)
    {
        var project = await _context.GetSet<Novologs.Domain.Entities.Project>()
            .Include(p => p.Tasks)
            .ThenInclude(t => t.Status!.Name.LocalizedStrings)
            .Include(p => p.Tasks).ThenInclude(t => t.Members).ThenInclude(m => m.Status!.Name.LocalizedStrings)
            .Include(p => p.Tasks).ThenInclude(t => t.Members).ThenInclude(m => m.TenantUser)
            .Include(p => p.ProjectMembers)
            .ThenInclude(pm => pm.Member)
            .AsNoTracking()
            .AsSingleQuery()
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);
        var taskStatuses = await _context.GetSet<Novologs.Domain.Entities.TaskStatus>()
            .Include(ts => ts.Name.LocalizedStrings)
            .ToListAsync(cancellationToken);

        if (project == null)
        {
            return Result<GetProjectStatisticsResponse>.Failure("Project_004", "Project not found.");
        }

        var projectUsers = project.Tasks.SelectMany(t => t.Members)
            .Where(m => m?.TenantUser?.Id != null)
            .Select(m => m.TenantUser!)
            .DistinctBy(u => u!.Id)
            .ToList();
        var projectBackLog = project.Tasks.Where(t => t.Members.Count == 0).ToList();
        var projectTasks = project.Tasks.Where(t => t.Members.Count > 0).ToList();
        var response = new GetProjectStatisticsResponse
        {
            BacklogTaskCount = projectBackLog.Count(),
            TaskCount = projectTasks.Count(),
            TaskStatistics = taskStatuses.Select(status =>
            {
                var tasksWithStatus = projectTasks.Where(t => t.StatusId == status.Id).ToList();
                return new TaskStatistics
                {
                    Status = _mapper.Map<TaskStatusDto>(status), TaskCount = tasksWithStatus.Count
                };
            }).ToList(),
            UsersStatistics = projectUsers.Select(u => new UsersStatistics
            {
                User = _mapper.Map<TenantUserDto>(u),
                IsMember = project.ProjectMembers.Any(pm => pm.MemberId == u.Id),
                IsOwner = project.ProjectMembers.FirstOrDefault(pm => pm.MemberId == u.Id)?.isOwner ?? false,
                TotalTaskCount = projectTasks.Count(t => t.Members.Any(m => m.MemberId == u.Id)),
                TaskStatistics = projectTasks
                    .Where(t => t.Members.Any(m => m.MemberId == u.Id))
                    .GroupBy(t => t.Members.FirstOrDefault(m => m.MemberId == u.Id)?.Status)
                    .Select(g => new TaskStatistics
                    {
                        Status = g.Key != null ? _mapper.Map<TaskStatusDto>(g.Key) : null, TaskCount = g.Count()
                    })
                    .ToList()
            }).ToList()
        };
        return Result<GetProjectStatisticsResponse>.Success(response);
    }
}
