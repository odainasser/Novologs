using System.ComponentModel;
using Novologs.Application.Modules.Account.DebitNotes.DTOs;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.DebitNotes.Queries.GetDebitNotes;

[AuthorizePermission(Permissions.Accounting.ReadDebitNote)]
[Description("Retrieves a paginated, sortable, and searchable list of debit notes.")]
public record GetDebitNotesQuery : IRequest<Result<GetDebitNotesQueryResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
    public Guid? VendorId { get; init; }
    public DebitNoteStatus? Status { get; init; }
    public int? PurchaseInvoiceId { get; init; }
    public DateTime? From { get; init; }
    public DateTime? To { get; init; }
}

public class GetDebitNotesQueryResponse : FilteredResult<DebitNoteListItemDto> { }

public class GetDebitNotesQueryHandler : IRequestHandler<GetDebitNotesQuery, Result<GetDebitNotesQueryResponse>>
{
    private readonly ITenantDbContext _context;

    public GetDebitNotesQueryHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<GetDebitNotesQueryResponse>> Handle(GetDebitNotesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.GetSet<Novologs.Domain.Entities.DebitNote>()
            .AsNoTracking()
            .AsQueryable();

        if (request.VendorId.HasValue)
            query = query.Where(n => n.VendorId == request.VendorId.Value);

        if (request.Status.HasValue)
            query = query.Where(n => n.Status == request.Status.Value);

        if (request.PurchaseInvoiceId.HasValue)
            query = query.Where(n => n.PurchaseInvoiceId == request.PurchaseInvoiceId.Value);

        if (request.From.HasValue)
            query = query.Where(n => n.NoteDate >= request.From.Value);

        if (request.To.HasValue)
            query = query.Where(n => n.NoteDate <= request.To.Value);

        query = query.ApplySearch(request.Search);

        var result = new GetDebitNotesQueryResponse
        {
            Total = await query.CountAsync(cancellationToken)
        };

        if (request.Sort != null)
            query = query.ApplySorting(request.Sort);
        else
            query = query.OrderByDescending(n => n.NoteDate).ThenByDescending(n => n.Id);

        query = query.ApplyPagination(request.Pagination);

        var rawItems = await query
            .Select(n => new
            {
                n.Id,
                n.NoteNumber,
                n.VendorId,
                n.Currency,
                n.InvoiceType,
                n.Location,
                n.NoteDate,
                n.DueDate,
                n.PurchaseInvoiceId,
                n.Status,
                n.GrandTotal,
                n.Created,
                n.CreatedBy,
            })
            .ToListAsync(cancellationToken);

        var vendorIds = rawItems.Select(n => n.VendorId).Distinct().ToList();
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
            .Select(n => n.CreatedBy)
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

        result.Items = rawItems.Select(n => new DebitNoteListItemDto
        {
            Id                = n.Id,
            NoteNumber        = n.NoteNumber,
            VendorId          = n.VendorId,
            Currency          = n.Currency,
            InvoiceType       = n.InvoiceType,
            Location          = n.Location,
            NoteDate          = n.NoteDate,
            DueDate           = n.DueDate,
            PurchaseInvoiceId = n.PurchaseInvoiceId,
            Status            = n.Status,
            GrandTotal        = n.GrandTotal,
            Created           = n.Created,
            CreatedByUser     = Guid.TryParse(n.CreatedBy, out var creatorId) && userMap.TryGetValue(creatorId, out var user) ? user : null,
            Vendor            = n.VendorId != default && vendorMap.TryGetValue(n.VendorId, out var vendor) ? vendor : null,
        }).ToList();

        return Result<GetDebitNotesQueryResponse>.Success(result);
    }
}
