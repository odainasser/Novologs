using System.ComponentModel;
using Novologs.Application.Modules.Document.CommentThreads.Queries.GetCommentThread;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Document.CommentItems.Queries.GetCommentItem;

public record GetCommentItemQuery : IRequest<Result<GetCommentItemResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName(e.g., \"Content\", \"SenderId\", \"ThreadId\"), FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description("Sort criteria. Specify FieldName , SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }

    [Description("The ID of the comment thread to filter items by.")]
    public Guid? ThreadId { get; set; }
}

public class GetCommentItemResponse : FilteredResult<CommentItemDto>
{
}

public class GetCommentItemQueryValidator : AbstractValidator<GetCommentItemQuery>
{
    public GetCommentItemQueryValidator(ITenantDbContext context, IMapper mapper, IUser user)
    {
    }
}

public class GetCommentItemQueryHandler : IRequestHandler<GetCommentItemQuery, Result<GetCommentItemResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetCommentItemQueryHandler(ITenantDbContext context, IMapper mapper,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _userManager = userManager;
    }

    public async Task<Result<GetCommentItemResponse>> Handle(GetCommentItemQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetCommentItemResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.CommentItem>()
            .Include(i => i.Sender)
            .Include(i => i.Files)
            .ThenInclude(f => f.File)
            .Include(i => i.Mentions)
            .ThenInclude(m => m.User)
            .AsNoTracking()
            .AsSplitQuery();

        //can see user own comment or if mentioed or iv has "ViewAll" or "Read" permissions
        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<GetCommentItemResponse>.Failure("CommentItem_001", "User not found.");
        }

        //TODO remove one of them
        var hasViewAllPermission = await _userManager.HasPermissionAsync(_context, userId,
            Novologs.Domain.Constants.Permissions.Comments.ViewAll);
        var hasGeneralViewAllPermission = await _userManager.HasPermissionAsync(_context, userId,
            Novologs.Domain.Constants.Permissions.General.ViewAll);

        if (!hasViewAllPermission && !hasGeneralViewAllPermission)
        {
            query = query.Where(ci => ci.SenderId == userId || ci.Mentions.Any(m => m.UserId == userId));
        }


        if (request.ThreadId.HasValue)
        {
            query = query.Where(i => i.ThreadId == request.ThreadId);
        }


        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        result.Items = await query.ProjectTo<CommentItemDto>(_mapper.ConfigurationProvider)
            .ToListAsync(cancellationToken);

        return Result<GetCommentItemResponse>.Success(result);
    }
}
