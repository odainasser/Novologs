using Novologs.Application.Modules.Account.Common.Authorization;
using Novologs.Application.Modules.Account.Products.DTOs;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Constants;

namespace Novologs.Application.Modules.Account.Products.Commands.CreateProduct;

public record CreateProductResponse(int Id);
[AuthorizePermission(Permissions.Accounting.AddProduct)]
public record CreateProductCommand : IRequest<Result<CreateProductResponse>>
{
    public LocalizableTextInputDto Name { get; init; } = default!;
    public string? Description { get; init; }
    public string? Unit { get; init; }
    public decimal? TaxPercentage { get; init; }
    public bool IsActive { get; init; } = true;
}

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Result<CreateProductResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public CreateProductCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<CreateProductResponse>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var nameExists = await _context.GetSet<Novologs.Domain.Entities.Product>()
            .AnyAsync(p => p.Name.Value == request.Name.Value && !p.IsDeleted, cancellationToken);

        if (nameExists)
            return Result<CreateProductResponse>.Failure("PRD_409_DUPLICATE", $"A product with name '{request.Name.Value}' already exists.");

        var nameEntity = _mapper.Map<Novologs.Domain.Entities.LocalizableText>(request.Name);

        var product = new Novologs.Domain.Entities.Product(0)
        {
            Name          = nameEntity,
            Description   = request.Description?.Trim(),
            Unit          = request.Unit?.Trim(),
            TaxPercentage = request.TaxPercentage,
            IsActive      = request.IsActive
        };

        await _context.GetSet<Novologs.Domain.Entities.Product>().AddAsync(product, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<CreateProductResponse>.Success(new CreateProductResponse(product.Id));
    }
}
