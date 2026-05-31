using System.ComponentModel;
using Novologs.Application.Modules.Client.Clients.Dto;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Application.Tenant;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Client.Clients.Queries.GetClient;

public record GetClientQuery : IRequest<Result<GetClientResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName(e.g., \"Code\", \"Serial\" , \"Name\", \"Website\", \"Address\", " +
        "\"Email\", \"Phonenumber\", \"Emirate\", \"LocationLatitude\", \"LocationLongitude\", \"FolderId\", " +
        "\"CreatorId\", \"DocumentId\"), FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }
    public bool? IsAccount { get; init; }
}

public class GetClientResponse : FilteredResult<ClientDto>
{
}

public class GetClientQueryValidator : AbstractValidator<GetClientQuery>
{
    public GetClientQueryValidator(ITenantDbContext context)
    {
    }
}

public class GetClientQueryHandler : IRequestHandler<GetClientQuery, Result<GetClientResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly UserManager<TenantUser> _userManager;
    private readonly IUser _user;

    public GetClientQueryHandler(ITenantDbContext context, UserManager<TenantUser> userManager,
        IUser user, IMapper mapper)
    {
        _context = context;
        _userManager = userManager;
        _user = user;
        _mapper = mapper;
    }

    public async Task<Result<GetClientResponse>> Handle(GetClientQuery request, CancellationToken cancellationToken)
    {
        var result = new GetClientResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.Client>("")
            .AsNoTracking().AsSplitQuery();

        if (_user.IdGuid == null)
        {
            return Result<GetClientResponse>.Failure("Client_001", "User not found.");
        }
 
        var canViewAllClients = await _userManager.HasPermissionAsync(_context, _user.IdGuid.Value,
            Novologs.Domain.Constants.Permissions.Clients.ViewAllClients);
        var canViewAllGeneral = await _userManager.HasPermissionAsync(_context, _user.IdGuid.Value,
            Novologs.Domain.Constants.Permissions.General.ViewAll);

        if (!canViewAllClients && !canViewAllGeneral)
        {
            query = query.Where(c => c.CreatorId == _user.IdGuid);
        }

        if (request.IsAccount.HasValue)
        {
            query = query.Where(c => c.IsAccount == request.IsAccount.Value);
        }

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<ClientDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        if (result.Items.Any())
        {
            var rootFolders = await _context.GetSet<Novologs.Domain.Entities.Folder>()
                .Include(f => f.Subfolders)
                .FirstOrDefaultAsync(f => f.Type == FolderType.General && f.Name == Constants.FolderNames.Clients,
                    cancellationToken);

            var clientIdList = result.Items.Select(c => c.Id).ToList();

            var leadList = await _context.GetSet<ClientLead>()
                .Where(l => clientIdList.Contains(l.ClientId))
                .ToListAsync(cancellationToken);

            foreach (var clientDto in result.Items)
            {
                var rootFolder = rootFolders?.Subfolders?.FirstOrDefault(f => f.ClientId == clientDto.Id);
                clientDto.RootFolderId = rootFolder?.Id;
                clientDto.LeadCount =
                    leadList.Count(l => l.ClientId == clientDto.Id && l.LeadStatus == LeadStatus.Open);
                clientDto.LeadAmount = leadList
                    .Where(l => l.ClientId == clientDto.Id && l.LeadStatus == LeadStatus.Open)
                    .Sum(l => l.Value);
                clientDto.SalesCount =
                    leadList.Count(l => l.ClientId == clientDto.Id && l.LeadStatus == LeadStatus.Awarded);
                clientDto.SalesAmount = leadList
                    .Where(l => l.ClientId == clientDto.Id && l.LeadStatus == LeadStatus.Awarded)
                    .Sum(l => l.AwardedValue);
                clientDto.RejectedCount =
                    leadList.Count(l => l.ClientId == clientDto.Id && l.LeadStatus == LeadStatus.Rejected);
                clientDto.RejectedAmount = leadList
                    .Where(l => l.ClientId == clientDto.Id && l.LeadStatus == LeadStatus.Rejected).Sum(l => l.Value);
            }
        }

        return Result<GetClientResponse>.Success(result);
    }
}
