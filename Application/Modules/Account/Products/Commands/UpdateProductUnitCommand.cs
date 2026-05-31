using Novologs.Application.Modules.Account.Products.DTOs;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Account.Products.Commands.UpdateProductUnit;

[AuthorizePermission(Permissions.Accounting.UpdateProductUnit)]
public record UpdateProductUnitCommand : IRequest<Result<ProductUnitDto>>
{
    public Guid Id { get; init; }
    public LocalizableTextInputDto Name { get; init; } = default!;
}

public class UpdateProductUnitCommandHandler : IRequestHandler<UpdateProductUnitCommand, Result<ProductUnitDto>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateProductUnitCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<ProductUnitDto>> Handle(UpdateProductUnitCommand request, CancellationToken cancellationToken)
    {
        var unit = await _context.GetSet<Novologs.Domain.Entities.ProductUnit>()
            .Include(u => u.Name)
                .ThenInclude(n => n.LocalizedStrings)
            .FirstOrDefaultAsync(u => u.Id == request.Id && !u.IsDeleted, cancellationToken);

        if (unit is null)
            return Result<ProductUnitDto>.Failure("PUNIT_404_NOT_FOUND", $"Product unit with ID {request.Id} was not found.");

        var nameExists = await _context.GetSet<Novologs.Domain.Entities.ProductUnit>()
            .AnyAsync(u => u.Name.Value == request.Name.Value && u.Id != request.Id && !u.IsDeleted, cancellationToken);

        if (nameExists)
            return Result<ProductUnitDto>.Failure("PUNIT_409_DUPLICATE", $"A product unit with name '{request.Name.Value}' already exists.");

        unit.Name.Value = request.Name.Value.Trim();

        var existingStrings = unit.Name.LocalizedStrings.ToList();
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
                unit.Name.LocalizedStrings.Remove(existing);
            }
        }

        foreach (var ls in requestedMap.Values)
        {
            unit.Name.LocalizedStrings.Add(new Novologs.Domain.Entities.LocalizedString
            {
                Language = ls.Language,
                Value    = ls.Value
            });
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<ProductUnitDto>.Success(_mapper.Map<ProductUnitDto>(unit));
    }
}
