using System.ComponentModel;
using Novologs.Application.Modules.Account.PurchaseOrders.DTOs;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.PurchaseOrders.Queries.GetPurchaseOrders;

[Description("Retrieves a paginated, sortable, and searchable list of purchase orders.")]
[AuthorizePermission(Permissions.Accounting.ReadPurchaseOrder)]
public record GetPurchaseOrdersQuery : IRequest<Result<GetPurchaseOrdersQueryResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
    public Guid? VendorId { get; init; }
    public PurchaseOrderStatus? Status { get; init; }
    public DateTime? From { get; init; }
    public DateTime? To { get; init; }
}

public class GetPurchaseOrdersQueryResponse : FilteredResult<PurchaseOrderListItemDto> { }

public class GetPurchaseOrdersQueryHandler : IRequestHandler<GetPurchaseOrdersQuery, Result<GetPurchaseOrdersQueryResponse>>
{
    private readonly ITenantDbContext _context;

    public GetPurchaseOrdersQueryHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<GetPurchaseOrdersQueryResponse>> Handle(GetPurchaseOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.GetSet<Novologs.Domain.Entities.PurchaseOrder>()
            .AsNoTracking()
            .AsQueryable();

        if (request.VendorId.HasValue)
            query = query.Where(po => po.VendorId == request.VendorId.Value);

        if (request.Status.HasValue)
            query = query.Where(po => po.Status == request.Status.Value);

        if (request.From.HasValue)
            query = query.Where(po => po.PurchaseDate >= request.From.Value);

        if (request.To.HasValue)
            query = query.Where(po => po.PurchaseDate <= request.To.Value);

        query = query.ApplySearch(request.Search);

        var result = new GetPurchaseOrdersQueryResponse
        {
            Total = await query.CountAsync(cancellationToken)
        };

        if (request.Sort != null)
            query = query.ApplySorting(request.Sort);
        else
            query = query.OrderByDescending(po => po.PurchaseDate).ThenByDescending(po => po.Id);

        query = query.ApplyPagination(request.Pagination);

        var rawItems = await query
            .Select(po => new
            {
                po.Id,
                po.PoNumber,
                po.VendorId,
                po.Currency,
                po.OrderType,
                po.Terms,
                po.Location,
                po.PurchaseDate,
                po.DueDate,
                po.Status,
                po.GrandTotal,
                po.Created,
                po.CreatedBy,
            })
            .ToListAsync(cancellationToken);

        var vendorIds = rawItems.Select(po => po.VendorId).Distinct().ToList();
        var vendorMap = await _context.GetSet<Novologs.Domain.Entities.Vendor>()
            .AsNoTracking()
            .Where(v => vendorIds.Contains(v.Id) && !v.IsDeleted)
            .Select(v => new VendorSummaryDto
            {
                Id             = v.Id,
                Name           = v.Name,
                Code           = v.Code,
                Email          = v.Email,
                Phonenumber    = v.Phonenumber,
                ProfileImageUrl = v.LogoFile != null ? v.LogoFile.Url : null,
            })
            .ToDictionaryAsync(v => v.Id, cancellationToken);

        var creatorIds = rawItems
            .Select(po => po.CreatedBy)
            .Where(id => id != null)
            .Select(id => Guid.TryParse(id, out var g) ? g : (Guid?)null)
            .Where(g => g.HasValue)
            .Select(g => g!.Value)
            .Distinct()
            .ToList();

        var userMap = await _context.GetSet<Novologs.Domain.Entities.TenantUser>()
            .AsNoTracking()
            .Where(u => creatorIds.Contains(u.Id))
            .Select(u => new UserSummaryDto
            {
                Id              = u.Id,
                FullName        = u.FullName,
                Email           = u.Email,
                UserName        = u.UserName,
                ProfileImageUrl = u.ProfileImageFile != null ? u.ProfileImageFile.Url : null,
            })
            .ToDictionaryAsync(u => u.Id, cancellationToken);

        var orderTypeIds = rawItems
            .Select(po => po.OrderType)
            .Where(id => id != null)
            .Select(id => Guid.TryParse(id, out var g) ? g : (Guid?)null)
            .Where(g => g.HasValue)
            .Select(g => g!.Value)
            .Distinct()
            .ToList();

        var orderTypeMap = await _context.GetSet<Novologs.Domain.Entities.ProductOrderType>()
            .AsNoTracking()
            .Where(ot => orderTypeIds.Contains(ot.Id) && !ot.IsDeleted)
            .Select(ot => new LocalizedLookupDto
            {
                Id    = ot.Id,
                Value = ot.Name.Value,
                LocalizedStrings = ot.Name.LocalizedStrings
                    .Select(ls => new LocalizedStringItemDto { Language = ls.Language, Value = ls.Value })
                    .ToList(),
            })
            .ToDictionaryAsync(ot => ot.Id, cancellationToken);

        var termsIds = rawItems
            .Select(po => po.Terms)
            .Where(id => id != null)
            .Select(id => Guid.TryParse(id, out var g) ? g : (Guid?)null)
            .Where(g => g.HasValue)
            .Select(g => g!.Value)
            .Distinct()
            .ToList();

        var termsMap = await _context.GetSet<Novologs.Domain.Entities.ProductTerm>()
            .AsNoTracking()
            .Where(t => termsIds.Contains(t.Id) && !t.IsDeleted)
            .Select(t => new LocalizedLookupDto
            {
                Id    = t.Id,
                Value = t.Name.Value,
                LocalizedStrings = t.Name.LocalizedStrings
                    .Select(ls => new LocalizedStringItemDto { Language = ls.Language, Value = ls.Value })
                    .ToList(),
            })
            .ToDictionaryAsync(t => t.Id, cancellationToken);

        result.Items = rawItems.Select(po => new PurchaseOrderListItemDto
        {
            Id            = po.Id,
            PoNumber      = po.PoNumber,
            VendorId      = po.VendorId,
            Currency      = po.Currency,
            OrderType     = Guid.TryParse(po.OrderType, out var otId) && orderTypeMap.TryGetValue(otId, out var ot) ? ot : null,
            Terms         = Guid.TryParse(po.Terms, out var tId) && termsMap.TryGetValue(tId, out var term) ? term : null,
            Location      = po.Location,
            PurchaseDate  = po.PurchaseDate,
            DueDate       = po.DueDate,
            Status        = po.Status,
            GrandTotal    = po.GrandTotal,
            Created       = po.Created,
            CreatedByUser = Guid.TryParse(po.CreatedBy, out var creatorId) && userMap.TryGetValue(creatorId, out var user) ? user : null,
            Vendor        = po.VendorId != default && vendorMap.TryGetValue(po.VendorId, out var vendor) ? vendor : null,
        }).ToList();

        return Result<GetPurchaseOrdersQueryResponse>.Success(result);
    }
}
