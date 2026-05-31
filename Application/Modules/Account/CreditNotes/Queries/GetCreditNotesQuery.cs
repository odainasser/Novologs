using System.ComponentModel;
using Novologs.Application.Modules.Account.CreditNotes.DTOs;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.CreditNotes.Queries.GetCreditNotes;

[AuthorizePermission(Permissions.Accounting.ReadCreditNote)]
[Description("Retrieves a paginated, sortable, and searchable list of credit notes.")]
public record GetCreditNotesQuery : IRequest<Result<GetCreditNotesQueryResponse>>, IFilter
{
    public SearchFilter? Search { get; set; }
    public SortFilter? Sort { get; set; }
    public PaginationFilter? Pagination { get; set; }
    public Guid? ClientId { get; init; }
    public CreditNoteStatus? Status { get; init; }
    public int? SalesInvoiceId { get; init; }
    public DateTime? From { get; init; }
    public DateTime? To { get; init; }
}

public class GetCreditNotesQueryResponse : FilteredResult<CreditNoteListItemDto> { }

public class GetCreditNotesQueryHandler : IRequestHandler<GetCreditNotesQuery, Result<GetCreditNotesQueryResponse>>
{
    private readonly ITenantDbContext _context;

    public GetCreditNotesQueryHandler(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<Result<GetCreditNotesQueryResponse>> Handle(GetCreditNotesQuery request, CancellationToken cancellationToken)
    {
        var query = _context.GetSet<Novologs.Domain.Entities.CreditNote>()
            .AsNoTracking()
            .AsQueryable();

        if (request.ClientId.HasValue)
            query = query.Where(n => n.ClientId == request.ClientId.Value);

        if (request.Status.HasValue)
            query = query.Where(n => n.Status == request.Status.Value);

        if (request.SalesInvoiceId.HasValue)
            query = query.Where(n => n.SalesInvoiceId == request.SalesInvoiceId.Value);

        if (request.From.HasValue)
            query = query.Where(n => n.NoteDate >= request.From.Value);

        if (request.To.HasValue)
            query = query.Where(n => n.NoteDate <= request.To.Value);

        query = query.ApplySearch(request.Search);

        var result = new GetCreditNotesQueryResponse
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
                n.ClientId,
                n.Currency,
                n.InvoiceType,
                n.Location,
                n.NoteDate,
                n.DueDate,
                n.SalesInvoiceId,
                n.Status,
                n.GrandTotal,
                n.Created,
                n.CreatedBy,
            })
            .ToListAsync(cancellationToken);

        var clientIds = rawItems.Select(n => n.ClientId).Distinct().ToList();
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

        result.Items = rawItems.Select(n => new CreditNoteListItemDto
        {
            Id            = n.Id,
            NoteNumber    = n.NoteNumber,
            ClientId      = n.ClientId,
            Currency      = n.Currency,
            InvoiceType   = n.InvoiceType,
            Location      = n.Location,
            NoteDate      = n.NoteDate,
            DueDate       = n.DueDate,
            SalesInvoiceId = n.SalesInvoiceId,
            Status        = n.Status,
            GrandTotal    = n.GrandTotal,
            Created       = n.Created,
            CreatedByUser = Guid.TryParse(n.CreatedBy, out var creatorId) && userMap.TryGetValue(creatorId, out var user) ? user : null,
            Client        = n.ClientId != default && clientMap.TryGetValue(n.ClientId, out var client) ? client : null,
        }).ToList();

        return Result<GetCreditNotesQueryResponse>.Success(result);
    }
}
