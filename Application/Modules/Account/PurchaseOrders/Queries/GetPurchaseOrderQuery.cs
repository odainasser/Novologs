using Novologs.Application.Modules.Account.PurchaseOrders.DTOs;
using Novologs.Application.Modules.Account.PurchaseOrders.Interfaces;
using Microsoft.EntityFrameworkCore;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.PurchaseOrders.Queries.GetPurchaseOrder;

[AuthorizePermission(Permissions.Accounting.ReadPurchaseOrder)]
public record GetPurchaseOrderQuery(int Id) : IRequest<Result<PurchaseOrderDto>>;

public class GetPurchaseOrderQueryHandler : IRequestHandler<GetPurchaseOrderQuery, Result<PurchaseOrderDto>>
{
    private readonly IPurchaseOrderRepository _repository;
    private readonly ITenantDbContext         _context;
    private readonly IMapper                  _mapper;

    public GetPurchaseOrderQueryHandler(IPurchaseOrderRepository repository, ITenantDbContext context, IMapper mapper)
    {
        _repository = repository;
        _context    = context;
        _mapper     = mapper;
    }

    public async Task<Result<PurchaseOrderDto>> Handle(GetPurchaseOrderQuery request, CancellationToken cancellationToken)
    {
        var po = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (po is null)
            return Result<PurchaseOrderDto>.Failure("PO_404_NOT_FOUND", $"Purchase order with ID {request.Id} was not found.");

        var dto = _mapper.Map<PurchaseOrderDto>(po);

        // Resolve product names (load separately with IgnoreQueryFilters to handle soft-deleted products)
        var productIdList = po.Items.Select(i => i.ProductId).Distinct().ToList();
        if (productIdList.Count > 0)
        {
            var products = await _context.GetSet<Novologs.Domain.Entities.Product>()
                .IgnoreQueryFilters()
                .Include(p => p.Name)
                    .ThenInclude(n => n.LocalizedStrings)
                .Where(p => productIdList.Contains(p.Id))
                .AsNoTracking()
                .ToDictionaryAsync(p => p.Id, cancellationToken);

            var itemProductMap = po.Items.ToDictionary(i => i.Id, i => i.ProductId);
            foreach (var dtoItem in dto.Items)
            {
                if (itemProductMap.TryGetValue(dtoItem.Id, out var productId) &&
                    products.TryGetValue(productId, out var product))
                {
                    dtoItem.Product = new ProductSummaryDto
                    {
                        Id               = product.Id,
                        Value            = product.Name?.Value ?? string.Empty,
                        LocalizedStrings = product.Name?.LocalizedStrings
                            .Select(ls => new LocalizedStringItemDto { Language = ls.Language, Value = ls.Value })
                            .ToList() ?? new List<LocalizedStringItemDto>()
                    };
                }
                else if (itemProductMap.TryGetValue(dtoItem.Id, out var fallbackId))
                {
                    dtoItem.Product = new ProductSummaryDto { Id = fallbackId };
                }
            }
        }

        // Resolve unit names from ProductUnit entities
        var rawItemUnitMap = po.Items
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

        return Result<PurchaseOrderDto>.Success(dto);
    }
}
