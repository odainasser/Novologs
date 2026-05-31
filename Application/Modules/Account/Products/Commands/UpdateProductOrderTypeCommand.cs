using Novologs.Application.Modules.Account.Products.DTOs;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Account.Products.Commands.UpdateProductOrderType;

[AuthorizePermission(Permissions.Accounting.UpdateProductOrderType)]
public record UpdateProductOrderTypeCommand : IRequest<Result<ProductOrderTypeDto>>
{
    public Guid Id { get; init; }
    public LocalizableTextInputDto Name { get; init; } = default!;
}

public class UpdateProductOrderTypeCommandHandler : IRequestHandler<UpdateProductOrderTypeCommand, Result<ProductOrderTypeDto>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateProductOrderTypeCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<ProductOrderTypeDto>> Handle(UpdateProductOrderTypeCommand request, CancellationToken cancellationToken)
    {
        var orderType = await _context.GetSet<Novologs.Domain.Entities.ProductOrderType>()
            .Include(o => o.Name)
                .ThenInclude(n => n.LocalizedStrings)
            .FirstOrDefaultAsync(o => o.Id == request.Id && !o.IsDeleted, cancellationToken);

        if (orderType is null)
            return Result<ProductOrderTypeDto>.Failure("POTYPE_404_NOT_FOUND", $"Product order type with ID {request.Id} was not found.");

        var nameExists = await _context.GetSet<Novologs.Domain.Entities.ProductOrderType>()
            .AnyAsync(o => o.Name.Value == request.Name.Value && o.Id != request.Id && !o.IsDeleted, cancellationToken);

        if (nameExists)
            return Result<ProductOrderTypeDto>.Failure("POTYPE_409_DUPLICATE", $"A product order type with name '{request.Name.Value}' already exists.");

        orderType.Name.Value = request.Name.Value.Trim();

        var existingStrings = orderType.Name.LocalizedStrings.ToList();
        var requestedMap = request.Name.LocalizedStrings
            .GroupBy(ls => ls.Language, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.Last(), StringComparer.OrdinalIgnoreCase);

        foreach (var existing in existingStrings)
        {
            if (requestedMap.TryGetValue(existing.Language, out var req))
            {
                existing.Value = req.Value;
                requestedMap.Remove(existing.Language);
            }
            else
            {
                orderType.Name.LocalizedStrings.Remove(existing);
            }
        }

        foreach (var ls in requestedMap.Values)
        {
            orderType.Name.LocalizedStrings.Add(new Novologs.Domain.Entities.LocalizedString
            {
                Language = ls.Language,
                Value    = ls.Value
            });
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<ProductOrderTypeDto>.Success(_mapper.Map<ProductOrderTypeDto>(orderType));
    }
}
