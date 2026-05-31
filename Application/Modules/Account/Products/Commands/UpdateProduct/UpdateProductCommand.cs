using Novologs.Application.Modules.Account.Products.DTOs;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Account.Products.Commands.UpdateProduct;
[AuthorizePermission(Permissions.Accounting.UpdateProduct)]
public record UpdateProductCommand : IRequest<Result<ProductDto>>
{
    public int Id { get; init; }
    public LocalizableTextInputDto Name { get; init; } = default!;
    public string? Description { get; init; }
    public string? Unit { get; init; }
    public decimal? TaxPercentage { get; init; }
    public bool IsActive { get; init; } = true;
}

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, Result<ProductDto>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateProductCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<ProductDto>> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.GetSet<Novologs.Domain.Entities.Product>()
            .Include(p => p.Name)
                .ThenInclude(n => n.LocalizedStrings)
            .FirstOrDefaultAsync(p => p.Id == request.Id && !p.IsDeleted, cancellationToken);

        if (product is null)
            return Result<ProductDto>.Failure("PRD_404_NOT_FOUND", $"Product with ID {request.Id} was not found.");

        var nameExists = await _context.GetSet<Novologs.Domain.Entities.Product>()
            .AnyAsync(p => p.Name.Value == request.Name.Value && p.Id != request.Id && !p.IsDeleted, cancellationToken);

        if (nameExists)
            return Result<ProductDto>.Failure("PRD_409_DUPLICATE", $"A product with name '{request.Name.Value}' already exists.");

        product.Name.Value = request.Name.Value.Trim();

        // Merge LocalizedStrings in-place rather than clearing the collection.
        // Clearing marks all tracked entities as Deleted, which forces the
        // SoftDeleteInterceptor to do a DB round-trip per entity â€” fragile under async.
        var existingStrings = product.Name.LocalizedStrings.ToList();
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
                product.Name.LocalizedStrings.Remove(existing);
            }
        }

        foreach (var ls in requestedMap.Values)
        {
            product.Name.LocalizedStrings.Add(new Novologs.Domain.Entities.LocalizedString
            {
                Language = ls.Language,
                Value    = ls.Value
            });
        }

        product.Description   = request.Description?.Trim();
        product.Unit          = request.Unit?.Trim();
        product.TaxPercentage = request.TaxPercentage;
        product.IsActive      = request.IsActive;

        await _context.SaveChangesAsync(cancellationToken);

        return Result<ProductDto>.Success(_mapper.Map<ProductDto>(product));
    }
}
