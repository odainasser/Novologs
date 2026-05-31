using Novologs.Application.Common.Models;
using Novologs.Application.Modules.Tasks.Tasks.Dto;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Tenant;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Tasks.Tasks.Queries.GetTask;

public record GetTaskQuery : IRequest<Result<ProjectTaskDto>>
{
    public Guid Id { get; set; }
}

public class GetTaskQueryValidator : AbstractValidator<GetTaskQuery>
{
    public GetTaskQueryValidator()
    {
    }
}

public class GetTaskQueryHandler : IRequestHandler<GetTaskQuery, Result<ProjectTaskDto>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetTaskQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<ProjectTaskDto>> Handle(GetTaskQuery request, CancellationToken cancellationToken)
    {
        IQueryable<ProjectTask> query = _context.GetSet<Novologs.Domain.Entities.ProjectTask>
            ("Creator.Designation.Name.LocalizedStrings," +
             "Creator.ProfileImageFile," +
             "Members.TenantUser.ProfileImageFile," +
             "Members.TenantUser.Designation.Name.LocalizedStrings," +
             "Members.Status.Name.LocalizedStrings," +
             "Project,MileStone,Client,ClientLead,Vendor," +
             "VendorContract," +
             "Status.Name.LocalizedStrings," +
             "Category.Name.LocalizedStrings," +
             "Priority.Name.LocalizedStrings," +
             "ParentTask,AudioFile,ChildTasks,TodoItems.Members," +
             "TimeLines.Creator.Designation.Name.LocalizedStrings," +
             "TimeLines.Creator.ProfileImageFile," +
             "TimeLines.Creator.Department.Name.LocalizedStrings," +
             "CommentThread.Items")
            .AsNoTracking().AsSplitQuery()
            .Where(u => u.Id == request.Id);

        var taskDb = await query.FirstOrDefaultAsync(cancellationToken);

        if (taskDb is not null)
        {
            var task = _mapper.Map<ProjectTaskDto>(taskDb);
            task.TimeLines = task.TimeLines.OrderBy(t => t.Date).ToList();

            var timesheets = await _context.GetSet<Novologs.Domain.Entities.TimeSheet>("")
                .Include(t => t.User)
                .Include(t => t.TimeSlots)
                .Where(t => t.TaskId == task.Id)
                .ToListAsync(cancellationToken);

            task.Cost = 0;
            task.Duration = TimeSpan.Zero;

            foreach (var timesheet in timesheets)
            {
                var taskTotalDuration = timesheet.TimeSlots.Aggregate(TimeSpan.Zero, (sum, ts) => sum + ts.Duration);
                task.Duration += taskTotalDuration;
                task.Cost += timesheet.User!.HourlyRate * (decimal)taskTotalDuration.TotalHours;
            }

            var rootFolders = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                .Include(f => f.Subfolders)
                .FirstOrDefaultAsync(f => f.Type == FolderType.General && f.Name == Constants.FolderNames.Tasks,
                    cancellationToken);

            var rootFolder = rootFolders?.Subfolders?.FirstOrDefault(f => f.TaskId == task.Id);
            task.RootFolderId = rootFolder?.Id;

            return Result<ProjectTaskDto>.Success(task);
        }
        else
        {
            return Result<ProjectTaskDto>.Failure(new List<ErrorItem>()
            {
                new ErrorItem("Task_003", "Task not found")
            });
        }
    }
}

