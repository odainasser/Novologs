using System.ComponentModel;
using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Authorization;
using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Document.CommentThreads.Queries.GetCommentThread;

public record GetCommentThreadQuery : IRequest<Result<GetCommentThreadResponse>>, IFilter
{
    [Description(
        "Search criteria. Specify FieldName(e.g., \"Items.Content\", \"Items.Sender.UserName\")," +
        " FieldValue, Operator, and optional SubFilters.")]
    public SearchFilter? Search { get; set; }

    [Description(
        "Sort criteria. Specify FieldName (e.g., \"Created\", \"Items.Created\"), SortDirection (asc/desc), and optional SubSort.")]
    public SortFilter? Sort { get; set; }

    [Description("Pagination criteria. Specify PageNumber (1-based) and PageSize. If null, all items are returned.")]
    public PaginationFilter? Pagination { get; set; }

    [Description("The ID of the specific comment thread to retrieve.")]
    public Guid? ThreadId { get; set; }
}

public class GetCommentThreadResponse : FilteredResult<CommentThreadDto>
{
}

public class GetCommentThreadQueryValidator : AbstractValidator<GetCommentThreadQuery>
{
    public GetCommentThreadQueryValidator(ITenantDbContext context, IUser user)
    {
        RuleFor(x => x.ThreadId)
            .NotEmpty().WithMessage("ThreadId is required.");
        RuleFor(x => x.ThreadId)
            .MustAsync(async (threadId, cancellationToken) =>
                await context.GetSet<Novologs.Domain.Entities.CommentThread>()
                    .AnyAsync(t => t.Id == threadId, cancellationToken))
            .WithMessage("ThreadId is not a valid comment thread.");
    }
}

public class GetCommentThreadQueryHandler : IRequestHandler<GetCommentThreadQuery, Result<GetCommentThreadResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;
    private readonly UserManager<TenantUser> _userManager;

    public GetCommentThreadQueryHandler(ITenantDbContext context, IMapper mapper,
        IUser user,
        UserManager<TenantUser> userManager)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
        _userManager = userManager;
    }

    public async Task<Result<GetCommentThreadResponse>> Handle(GetCommentThreadQuery request,
        CancellationToken cancellationToken)
    {
        var result = new GetCommentThreadResponse();
        var query = _context.GetSet<Novologs.Domain.Entities.CommentThread>()
            .Include(t => t.Items)
            .ThenInclude(i => i.Sender)
            .Include(t => t.Items)
            .ThenInclude(i => i.Files)
            .ThenInclude(f => f.File)
            .Include(t => t.Items)
            .ThenInclude(i => i.Mentions)
            .ThenInclude(m => m.User)
            .AsNoTracking()
            .AsSplitQuery();
        if (!Guid.TryParse(_user.Id, out var userId))
        {
            return Result<GetCommentThreadResponse>.Failure("CommentThread_001", "User not found.");
        }

        var hasViewAllPermission = await _userManager.HasPermissionAsync(_context, userId,
            Novologs.Domain.Constants.Permissions.Comments.ViewAll);
        var hasGeneralViewAllPermission = await _userManager.HasPermissionAsync(_context, userId,
            Novologs.Domain.Constants.Permissions.General.ViewAll);

        if (request.ThreadId.HasValue)
        {
            query = query.Where(t => t.Id == request.ThreadId);
        }

        query = query.ApplySearch(request.Search);
        result.Total = await query.CountAsync(cancellationToken);

        query = query.ApplySorting(request.Sort);
        query = query.ApplyPagination(request.Pagination);

        query = (await query.Select(t => new Novologs.Domain.Entities.CommentThread
        {
            Id = t.Id,
            Items = t.Items.OrderBy(i => i.Created).ToList(),
            Created = t.Created,
            CreatedBy = t.CreatedBy,
            LastModified = t.LastModified,
            LastModifiedBy = t.LastModifiedBy,
            IsDeleted = t.IsDeleted,
            DeletedOnDate = t.DeletedOnDate,
            DeletedBy = t.DeletedBy
        }).ToListAsync(cancellationToken)).AsQueryable();

        result.Items = query.ProjectTo<CommentThreadDto>(_mapper.ConfigurationProvider).ToList();

        return Result<GetCommentThreadResponse>.Success(result);
    }
}
