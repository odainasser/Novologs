using System.ComponentModel;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Finance.Timesheets.Queries.GetTimesheet;

public record GetTimesheetQuery : IRequest<Result<GetTimesheetResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName(e.g., \"Date\", \"UserId\", \"TaskId\")," +
        " FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }
}

public class GetTimesheetResponse : FilteredResult<TimesheetDto>
{
}

public class GetTimesheetQueryValidator : AbstractValidator<GetTimesheetQuery>
{
    public GetTimesheetQueryValidator()
    {
    }
}

public class GetTimesheetQueryHandler : IRequestHandler<GetTimesheetQuery, Result<GetTimesheetResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetTimesheetQueryHandler(ITenantDbContext context, IMapper mapper,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _userManager = userManager;
    }

    public async Task<Result<GetTimesheetResponse>> Handle(GetTimesheetQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetTimesheetResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.TimeSheet>("")
            .Include(t => t.TimeSlots)
            .AsNoTracking().AsSplitQuery();
        var hasViewAllPermission = await _userManager.HasPermissionAsync(_context, Guid.Parse(_user.Id!),
            Novologs.Domain.Constants.Permissions.Finance.ViewAllTimesheets) || await _userManager.HasPermissionAsync(_context, Guid.Parse(_user.Id!),
            Novologs.Domain.Constants.Permissions.General.ViewAll);

        if (!hasViewAllPermission)
        {
            query = query.Where(t => t.UserId == Guid.Parse(_user.Id!));
        }

        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<GetTimesheetResponse>.Failure("Timesheet_002", "User not found.");
        }

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<TimesheetDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetTimesheetResponse>.Success(result);
    }
}
