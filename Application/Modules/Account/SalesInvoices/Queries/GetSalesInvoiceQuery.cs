using Novologs.Application.Modules.Account.SalesInvoices.DTOs;
using Novologs.Application.Modules.Account.SalesInvoices.Interfaces;
using Microsoft.EntityFrameworkCore;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.SalesInvoices.Queries.GetSalesInvoice;

[AuthorizePermission(Permissions.Accounting.ReadSalesInvoice)]
public record GetSalesInvoiceQuery(int Id) : IRequest<Result<SalesInvoiceDto>>;

public class GetSalesInvoiceQueryHandler : IRequestHandler<GetSalesInvoiceQuery, Result<SalesInvoiceDto>>
{
    private readonly ISalesInvoiceRepository _repository;
    private readonly IMapper _mapper;
    private readonly ITenantDbContext _context;

    public GetSalesInvoiceQueryHandler(ISalesInvoiceRepository repository, IMapper mapper, ITenantDbContext context)
    {
        _repository = repository;
        _mapper     = mapper;
        _context    = context;
    }

    public async Task<Result<SalesInvoiceDto>> Handle(GetSalesInvoiceQuery request, CancellationToken cancellationToken)
    {
        var invoice = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (invoice is null)
            return Result<SalesInvoiceDto>.Failure("SINV_404_NOT_FOUND", $"Sales invoice with ID {request.Id} was not found.");

        var dto = _mapper.Map<SalesInvoiceDto>(invoice);

        // Enrich Client
        var client = await _context.GetSet<Novologs.Domain.Entities.Client>()
            .AsNoTracking()
            .Where(c => c.Id == invoice.ClientId && !c.IsDeleted)
            .Select(c => new ClientSummaryDto
            {
                Id              = c.Id,
                Name            = c.Name,
                Code            = c.Code,
                Email           = c.Email,
                Phonenumber     = c.Phonenumber,
                ProfileImageUrl = c.LogoFile != null ? c.LogoFile.Url : null,
            })
            .FirstOrDefaultAsync(cancellationToken);
        dto.Client = client;

        // Enrich CreatedByUser
        if (Guid.TryParse(invoice.CreatedBy, out var creatorId))
        {
            var user = await _context.GetSet<Novologs.Domain.Entities.TenantUser>()
                .AsNoTracking()
                .Where(u => u.Id == creatorId)
                .Select(u => new UserSummaryDto
                {
                    Id              = u.Id,
                    FullName        = u.FullName,
                    Email           = u.Email,
                    UserName        = u.UserName,
                    ProfileImageUrl = u.ProfileImageFile != null ? u.ProfileImageFile.Url : null,
                })
                .FirstOrDefaultAsync(cancellationToken);
            dto.CreatedByUser = user;
        }

        // Resolve unit names from ProductUnit entities
        var rawItemUnitMap = invoice.Items
            .Where(i => i.Unit != null && Guid.TryParse(i.Unit, out _))
            .ToDictionary(i => i.Id, i => Guid.Parse(i.Unit!));

        if (rawItemUnitMap.Count > 0)
        {
            var unitIds = rawItemUnitMap.Values.Distinct().ToList();
            var units = await _context.GetSet<Novologs.Domain.Entities.ProductUnit>()
                .Include(u => u.Name)
                    .ThenInclude(n => n.LocalizedStrings)
                .Where(u => unitIds.Contains(u.Id))
                .AsNoTracking()
                .ToDictionaryAsync(u => u.Id, cancellationToken);

            foreach (var dtoItem in dto.Items)
            {
                if (rawItemUnitMap.TryGetValue(dtoItem.Id, out var unitId) && units.TryGetValue(unitId, out var unit))
                    dtoItem.Unit = new UnitSummaryDto
                    {
                        Id    = unitId,
                        Value = unit.Name.Value,
                        LocalizedStrings = unit.Name.LocalizedStrings
                            .Select(ls => new LocalizedStringItemDto { Language = ls.Language, Value = ls.Value })
                            .ToList()
                    };
            }
        }

        return Result<SalesInvoiceDto>.Success(dto);
    }
}
