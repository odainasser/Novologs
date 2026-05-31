using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Account.Products.Commands.CreateProductOrderType;

public record CreateProductOrderTypeResponse(Guid Id);

[AuthorizePermission(Permissions.Accounting.AddProductOrderType)]
public record CreateProductOrderTypeCommand : IRequest<Result<CreateProductOrderTypeResponse>>
{
    public LocalizableTextInputDto Name { get; init; } = default!;
}

public class CreateProductOrderTypeCommandHandler : IRequestHandler<CreateProductOrderTypeCommand, Result<CreateProductOrderTypeResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public CreateProductOrderTypeCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<CreateProductOrderTypeResponse>> Handle(CreateProductOrderTypeCommand request, CancellationToken cancellationToken)
    {
        var nameExists = await _context.GetSet<Novologs.Domain.Entities.ProductOrderType>()
            .AnyAsync(o => o.Name.Value == request.Name.Value && !o.IsDeleted, cancellationToken);

        if (nameExists)
            return Result<CreateProductOrderTypeResponse>.Failure("POTYPE_409_DUPLICATE", $"A product order type with name '{request.Name.Value}' already exists.");

        var nameEntity = _mapper.Map<Novologs.Domain.Entities.LocalizableText>(request.Name);

        var orderType = new Novologs.Domain.Entities.ProductOrderType
        {
            Name = nameEntity
        };

        await _context.GetSet<Novologs.Domain.Entities.ProductOrderType>().AddAsync(orderType, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<CreateProductOrderTypeResponse>.Success(new CreateProductOrderTypeResponse(orderType.Id));
    }
}
