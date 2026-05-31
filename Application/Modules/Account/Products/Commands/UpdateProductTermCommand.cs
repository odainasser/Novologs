using Novologs.Application.Modules.Account.Products.DTOs;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Account.Products.Commands.UpdateProductTerm;
[AuthorizePermission(Permissions.Accounting.UpdateProductTerm)]
public record UpdateProductTermCommand : IRequest<Result<ProductTermDto>>
{
    public Guid Id { get; init; }
    public LocalizableTextInputDto Name { get; init; } = default!;
}

public class UpdateProductTermCommandHandler : IRequestHandler<UpdateProductTermCommand, Result<ProductTermDto>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateProductTermCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<ProductTermDto>> Handle(UpdateProductTermCommand request, CancellationToken cancellationToken)
    {
        var term = await _context.GetSet<Novologs.Domain.Entities.ProductTerm>()
            .Include(t => t.Name)
                .ThenInclude(n => n.LocalizedStrings)
            .FirstOrDefaultAsync(t => t.Id == request.Id && !t.IsDeleted, cancellationToken);

        if (term is null)
            return Result<ProductTermDto>.Failure("PTERM_404_NOT_FOUND", $"Product term with ID {request.Id} was not found.");

        var nameExists = await _context.GetSet<Novologs.Domain.Entities.ProductTerm>()
            .AnyAsync(t => t.Name.Value == request.Name.Value && t.Id != request.Id && !t.IsDeleted, cancellationToken);

        if (nameExists)
            return Result<ProductTermDto>.Failure("PTERM_409_DUPLICATE", $"A product term with name '{request.Name.Value}' already exists.");

        term.Name.Value = request.Name.Value.Trim();

        var existingStrings = term.Name.LocalizedStrings.ToList();
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
                term.Name.LocalizedStrings.Remove(existing);
            }
        }

        foreach (var ls in requestedMap.Values)
        {
            term.Name.LocalizedStrings.Add(new Novologs.Domain.Entities.LocalizedString
            {
                Language = ls.Language,
                Value    = ls.Value
            });
        }

        await _context.SaveChangesAsync(cancellationToken);

        return Result<ProductTermDto>.Success(_mapper.Map<ProductTermDto>(term));
    }
}
