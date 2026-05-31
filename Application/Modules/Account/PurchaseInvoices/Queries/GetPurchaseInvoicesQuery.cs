using System.ComponentModel;
using Novologs.Application.Modules.Account.PurchaseInvoices.DTOs;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.PurchaseInvoices.Queries.GetPurchaseInvoices;

[AuthorizePermission(Permissions.Accounting.ReadPurchaseInvoice)]
[Description("Retrieves a paginated, sortable, and searchable list of purchase invoices.")]
public record GetPurchaseInvoicesQuery : IRequest<Result<GetPurchaseInvoicesQueryResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
    public Guid? VendorId { get; init; }
    public PurchaseInvoiceStatus? Status { get; init; }
    public InvoiceType? InvoiceType { get; init; }
    public int? PurchaseOrderId { get; init; }
    public DateTime? From { get; init; }
    public DateTime? To { get; init; }
}

public class GetPurchaseInvoicesQueryResponse : FilteredResult<PurchaseInvoiceListItemDto> { }

public class GetPurchaseInvoicesQueryHandler : IRequestHandler<GetPurchaseInvoicesQuery, Result<GetPurchaseInvoicesQueryResponse>>
{
    private readonly ITenantDbContext _context;

    public GetPurchaseInvoicesQueryHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<GetPurchaseInvoicesQueryResponse>> Handle(GetPurchaseInvoicesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.GetSet<Novologs.Domain.Entities.PurchaseInvoice>()
            .AsNoTracking()
            .AsQueryable();

        if (request.VendorId.HasValue)
            query = query.Where(inv => inv.VendorId == request.VendorId.Value);

        if (request.Status.HasValue)
            query = query.Where(inv => inv.Status == request.Status.Value);

        if (request.InvoiceType.HasValue)
            query = query.Where(inv => inv.InvoiceType == request.InvoiceType.Value);

        if (request.PurchaseOrderId.HasValue)
            query = query.Where(inv => inv.PurchaseOrderId == request.PurchaseOrderId.Value);

        if (request.From.HasValue)
            query = query.Where(inv => inv.InvoiceDate >= request.From.Value);

        if (request.To.HasValue)
            query = query.Where(inv => inv.InvoiceDate <= request.To.Value);

        query = query.ApplySearch(request.Search);

        var result = new GetPurchaseInvoicesQueryResponse
        {
            Total = await query.CountAsync(cancellationToken)
        };

        if (request.Sort != null)
            query = query.ApplySorting(request.Sort);
        else
            query = query.OrderByDescending(inv => inv.InvoiceDate).ThenByDescending(inv => inv.Id);

        query = query.ApplyPagination(request.Pagination);

        var rawItems = await query
            .Select(inv => new
            {
                inv.Id,
                inv.InvNumber,
                inv.VendorId,
                inv.Currency,
                inv.InvoiceType,
                inv.Terms,
                inv.Location,
                inv.InvoiceDate,
                inv.DueDate,
                inv.PurchaseOrderId,
                inv.Status,
                inv.GrandTotal,
                inv.Created,
                inv.CreatedBy,
            })
            .ToListAsync(cancellationToken);

        var vendorIds = rawItems.Select(inv => inv.VendorId).Distinct().ToList();
        var vendorMap = await _context.GetSet<Novologs.Domain.Entities.Vendor>()
            .AsNoTracking()
            .Where(v => vendorIds.Contains(v.Id) && !v.IsDeleted)
            .Select(v => new VendorSummaryDto
            {
                Id              = v.Id,
                Name            = v.Name,
                Code            = v.Code,
                Email           = v.Email,
                Phonenumber     = v.Phonenumber,
                ProfileImageUrl = v.LogoFile != null ? v.LogoFile.Url : null,
            })
            .ToDictionaryAsync(v => v.Id, cancellationToken);

        var creatorIds = rawItems
            .Select(inv => inv.CreatedBy)
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

        var termsIds = rawItems
            .Select(inv => inv.Terms)
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

        result.Items = rawItems.Select(inv => new PurchaseInvoiceListItemDto
        {
            Id              = inv.Id,
            InvNumber       = inv.InvNumber,
            VendorId        = inv.VendorId,
            Currency        = inv.Currency,
            InvoiceType     = inv.InvoiceType,
            Terms           = Guid.TryParse(inv.Terms, out var tId) && termsMap.TryGetValue(tId, out var term) ? term : null,
            Location        = inv.Location,
            InvoiceDate     = inv.InvoiceDate,
            DueDate         = inv.DueDate,
            PurchaseOrderId = inv.PurchaseOrderId,
            Status          = inv.Status,
            GrandTotal      = inv.GrandTotal,
            Created         = inv.Created,
            CreatedByUser   = Guid.TryParse(inv.CreatedBy, out var creatorId) && userMap.TryGetValue(creatorId, out var user) ? user : null,
            Vendor          = inv.VendorId != default && vendorMap.TryGetValue(inv.VendorId, out var vendor) ? vendor : null,
        }).ToList();

        return Result<GetPurchaseInvoicesQueryResponse>.Success(result);
    }
}
