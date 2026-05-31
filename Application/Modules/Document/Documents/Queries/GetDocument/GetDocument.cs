using System.ComponentModel;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Document.Documents.Queries.GetDocument;

public record GetDocumentQuery : IRequest<Result<GetDocumentResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName(e.g., \"Code\", \"Serial\" , \"CurrentVersion\", \"Visibiltiy\", \"Type\", \"Status\", " +
        "\"CreatorId\", \"ParentNodeId\", \"DocumentCategoryId\", \"FolderId\", \"CommentThreadId\", \"TaskId\", \"ProjectId\", " +
        "\"MileStoneId\", \"ClientId\", \"ClientLeadId\", \"VendorId\", \"VendorContractId\")," +
        " FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }
}

public class GetDocumentResponse : FilteredResult<DocumentDto>
{
    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.DocumentNode, DocumentDto>();
        }
    }
}

public class GetDocumentQueryValidator : AbstractValidator<GetDocumentQuery>
{
    public GetDocumentQueryValidator(ITenantDbContext context)
    {
    }
}

public class GetDocumentQueryHandler : IRequestHandler<GetDocumentQuery, Result<GetDocumentResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetDocumentQueryHandler(ITenantDbContext context, IMapper mapper, IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _userManager = userManager;
    }

    public async Task<Result<GetDocumentResponse>> Handle(GetDocumentQuery request, CancellationToken cancellationToken)
    {
        var result = new GetDocumentResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.DocumentNode>()
            .Include(d => d.DocumentVersionList)
            .AsNoTracking()
            .AsSplitQuery();

        var hasViewAllPermission = await _userManager.HasPermissionAsync(_context, Guid.Parse(_user.Id!),
            Novologs.Domain.Constants.Permissions.Documents.ViewAll);

        var hasGeneralViewAllPermission = await _userManager.HasPermissionAsync(_context, Guid.Parse(_user.Id!),
            Novologs.Domain.Constants.Permissions.General.ViewAll);

        if (!hasViewAllPermission && !hasGeneralViewAllPermission)
        {
            query = query.Where(d =>
                d.CreatorId == Guid.Parse(_user.Id!) ||
                d.Members.Any(m => m.MemberId == Guid.Parse(_user.Id!)) ||
                (d.ClientId.HasValue && d.Client!.CreatorId == Guid.Parse(_user.Id!)) ||
                (d.ClientLeadId.HasValue && (d.ClientLead!.CreatorId == Guid.Parse(_user.Id!) ||
                                             d.ClientLead.Client!.CreatorId == Guid.Parse(_user.Id!))) ||
                (d.VendorId.HasValue && d.Vendor!.CreatorId == Guid.Parse(_user.Id!)) ||
                (d.VendorContractId.HasValue && (d.VendorContract!.CreatorId == Guid.Parse(_user.Id!) ||
                                                 d.VendorContract.Vendor!.CreatorId == Guid.Parse(_user.Id!))) ||
                (d.TaskId.HasValue && d.Task!.Members.Any(m => m.MemberId == Guid.Parse(_user.Id!))) ||
                (d.TaskId.HasValue && d.Task!.Project!.Type == ProjectType.Ticketing &&
                 d.Task.Project.ProjectMembers.Any(m => m.MemberId == Guid.Parse(_user.Id!))) ||
                (d.TaskId.HasValue && d.Task!.CreatorId == Guid.Parse(_user.Id!)) ||
                (d.ProjectId.HasValue && d.Project!.ProjectMembers.Any(m => m.MemberId == Guid.Parse(_user.Id!))) ||
                (d.MileStoneId.HasValue &&
                 d.MileStone!.Project!.ProjectMembers.Any(m => m.MemberId == Guid.Parse(_user.Id!)))
            );
        }


        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<DocumentDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetDocumentResponse>.Success(result);
    }
}
