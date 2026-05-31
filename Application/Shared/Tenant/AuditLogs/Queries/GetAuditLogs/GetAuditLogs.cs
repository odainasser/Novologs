using System.ComponentModel;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.AuditLogs.Queries.GetAuditLogs;

public record GetAuditLogsQuery : IRequest<Result<GetAuditLogsResponse>>, IFilter
{
    [Description("Search criteria. Specify FieldName (e.g., \"EntityName\", \"EntityId\", \"Action\", \"ChangedBy\", \"PropertyName\"), FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName, SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }
}

public class GetAuditLogsResponse : FilteredResult<AuditLogDto>
{
}

public class GetAuditLogsQueryHandler : IRequestHandler<GetAuditLogsQuery, Result<GetAuditLogsResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public GetAuditLogsQueryHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<GetAuditLogsResponse>> Handle(GetAuditLogsQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetAuditLogsResponse();

        var allLogs = await _context.AuditLogs
            .AsNoTracking()
            .OrderByDescending(x => x.ChangedAt)
            .ToListAsync(cancellationToken);

        var query = allLogs.AsQueryable().ApplySearch(request.Search);
        result.Total = query.Count();

        query = request.Sort is not null ? query.ApplySorting(request.Sort) : query;
        query = query.ApplyPagination(request.Pagination);

        var dtos = query
            .ProjectTo<AuditLogDto>(_mapper.ConfigurationProvider)
            .ToList();

        // Resolve user IDs in ChangedBy to full names
        var userIds = dtos
            .Select(d => d.ChangedBy)
            .Where(id => id != null && Guid.TryParse(id, out _))
            .Select(id => Guid.Parse(id!))
            .Distinct()
            .ToList();

        if (userIds.Count > 0)
        {
            var userNames = await _context.GetSet<TenantUser>()
                .Where(u => userIds.Contains(u.Id))
                .Select(u => new { u.Id, u.FullName })
                .ToDictionaryAsync(u => u.Id.ToString(), u => u.FullName, cancellationToken);

            foreach (var dto in dtos)
            {
                if (dto.ChangedBy != null && userNames.TryGetValue(dto.ChangedBy, out var name))
                    dto.ChangedBy = name;
            }
        }

        result.Items = dtos;

        return Result<GetAuditLogsResponse>.Success(result);
    }
}
