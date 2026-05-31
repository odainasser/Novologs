using Novologs.Application.Modules.Account.PurchaseInvoices.DTOs;
using Novologs.Application.Modules.Account.PurchaseInvoices.Interfaces;
using Microsoft.EntityFrameworkCore;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.PurchaseInvoices.Queries.GetPurchaseInvoice;


[AuthorizePermission(Permissions.Accounting.ReadPurchaseInvoice)]

public record GetPurchaseInvoiceQuery(int Id) : IRequest<Result<PurchaseInvoiceDto>>;

public class GetPurchaseInvoiceQueryHandler : IRequestHandler<GetPurchaseInvoiceQuery, Result<PurchaseInvoiceDto>>
{
    private readonly IPurchaseInvoiceRepository _repository;
    private readonly IMapper _mapper;
    private readonly ITenantDbContext _context;

    public GetPurchaseInvoiceQueryHandler(IPurchaseInvoiceRepository repository, IMapper mapper, ITenantDbContext context)
    {
        _repository = repository;
        _mapper     = mapper;
        _context    = context;
    }

    public async Task<Result<PurchaseInvoiceDto>> Handle(GetPurchaseInvoiceQuery request, CancellationToken cancellationToken)
    {
        var invoice = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (invoice is null)
            return Result<PurchaseInvoiceDto>.Failure("INV_404_NOT_FOUND", $"Purchase invoice with ID {request.Id} was not found.");

        var dto = _mapper.Map<PurchaseInvoiceDto>(invoice);

        // Enrich Vendor
        var vendor = await _context.GetSet<Novologs.Domain.Entities.Vendor>()
            .AsNoTracking()
            .Where(v => v.Id == invoice.VendorId && !v.IsDeleted)
            .Select(v => new VendorSummaryDto
            {
                Id              = v.Id,
                Name            = v.Name,
                Code            = v.Code,
                Email           = v.Email,
                Phonenumber     = v.Phonenumber,
                ProfileImageUrl = v.LogoFile != null ? v.LogoFile.Url : null,
            })
            .FirstOrDefaultAsync(cancellationToken);
        dto.Vendor = vendor;

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

        return Result<PurchaseInvoiceDto>.Success(dto);
    }
}
