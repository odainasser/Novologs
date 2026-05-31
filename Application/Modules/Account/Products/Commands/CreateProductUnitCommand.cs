using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Account.Products.Commands.CreateProductUnit;

public record CreateProductUnitResponse(Guid Id);
[AuthorizePermission(Permissions.Accounting.AddProductUnit)]
public record CreateProductUnitCommand : IRequest<Result<CreateProductUnitResponse>>
{
    public LocalizableTextInputDto Name { get; init; } = default!;
}

public class CreateProductUnitCommandHandler : IRequestHandler<CreateProductUnitCommand, Result<CreateProductUnitResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public CreateProductUnitCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<CreateProductUnitResponse>> Handle(CreateProductUnitCommand request, CancellationToken cancellationToken)
    {
        var nameExists = await _context.GetSet<Novologs.Domain.Entities.ProductUnit>()
            .AnyAsync(u => u.Name.Value == request.Name.Value && !u.IsDeleted, cancellationToken);

        if (nameExists)
            return Result<CreateProductUnitResponse>.Failure("PUNIT_409_DUPLICATE", $"A product unit with name '{request.Name.Value}' already exists.");

        var nameEntity = _mapper.Map<Novologs.Domain.Entities.LocalizableText>(request.Name);

        var unit = new Novologs.Domain.Entities.ProductUnit
        {
            Name = nameEntity
        };

        await _context.GetSet<Novologs.Domain.Entities.ProductUnit>().AddAsync(unit, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<CreateProductUnitResponse>.Success(new CreateProductUnitResponse(unit.Id));
    }
}
