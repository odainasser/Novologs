using System.ComponentModel;
using Novologs.Application.Modules.Account.SalesInvoices.DTOs;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.SalesInvoices.Queries.GetSalesInvoices;

[Description("Retrieves a paginated, sortable, and searchable list of sales invoices.")]
[AuthorizePermission(Permissions.Accounting.ReadSalesInvoice)]
public record GetSalesInvoicesQuery : IRequest<Result<GetSalesInvoicesQueryResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
    public Guid? ClientId { get; init; }
    public SalesInvoiceStatus? Status { get; init; }
    public InvoiceType? InvoiceType { get; init; }
    public DateTime? From { get; init; }
    public DateTime? To { get; init; }
}

public class GetSalesInvoicesQueryResponse : FilteredResult<SalesInvoiceListItemDto> { }

public class GetSalesInvoicesQueryHandler : IRequestHandler<GetSalesInvoicesQuery, Result<GetSalesInvoicesQueryResponse>>
{
    private readonly ITenantDbContext _context;

    public GetSalesInvoicesQueryHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<GetSalesInvoicesQueryResponse>> Handle(GetSalesInvoicesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.GetSet<Novologs.Domain.Entities.SalesInvoice>()
            .AsNoTracking()
            .AsQueryable();

        if (request.ClientId.HasValue)
            query = query.Where(inv => inv.ClientId == request.ClientId.Value);

        if (request.Status.HasValue)
            query = query.Where(inv => inv.Status == request.Status.Value);

        if (request.InvoiceType.HasValue)
            query = query.Where(inv => inv.InvoiceType == request.InvoiceType.Value);

        if (request.From.HasValue)
            query = query.Where(inv => inv.InvoiceDate >= request.From.Value);

        if (request.To.HasValue)
            query = query.Where(inv => inv.InvoiceDate <= request.To.Value);

        query = query.ApplySearch(request.Search);

        var result = new GetSalesInvoicesQueryResponse
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
                inv.ClientId,
                inv.Currency,
                inv.InvoiceType,
                inv.Terms,
                inv.Location,
                inv.InvoiceDate,
                inv.DueDate,
                inv.Status,
                inv.GrandTotal,
                inv.Created,
                inv.CreatedBy,
            })
            .ToListAsync(cancellationToken);

        var clientIds = rawItems.Select(inv => inv.ClientId).Distinct().ToList();
        var clientMap = await _context.GetSet<Novologs.Domain.Entities.Client>()
            .AsNoTracking()
            .Where(c => clientIds.Contains(c.Id) && !c.IsDeleted)
            .Select(c => new ClientSummaryDto
            {
                Id              = c.Id,
                Name            = c.Name,
                Code            = c.Code,
                Email           = c.Email,
                Phonenumber     = c.Phonenumber,
                ProfileImageUrl = c.LogoFile != null ? c.LogoFile.Url : null,
            })
            .ToDictionaryAsync(c => c.Id, cancellationToken);

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

        result.Items = rawItems.Select(inv => new SalesInvoiceListItemDto
        {
            Id            = inv.Id,
            InvNumber     = inv.InvNumber,
            ClientId      = inv.ClientId,
            Currency      = inv.Currency,
            InvoiceType   = inv.InvoiceType,
            Terms         = Guid.TryParse(inv.Terms, out var tId) && termsMap.TryGetValue(tId, out var term) ? term : null,
            Location      = inv.Location,
            InvoiceDate   = inv.InvoiceDate,
            DueDate       = inv.DueDate,
            Status        = inv.Status,
            GrandTotal    = inv.GrandTotal,
            Created       = inv.Created,
            CreatedByUser = Guid.TryParse(inv.CreatedBy, out var creatorId) && userMap.TryGetValue(creatorId, out var user) ? user : null,
            Client        = inv.ClientId != default && clientMap.TryGetValue(inv.ClientId, out var client) ? client : null,
        }).ToList();

        return Result<GetSalesInvoicesQueryResponse>.Success(result);
    }
}
