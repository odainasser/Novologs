using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;

namespace Novologs.Application.Modules.Account.Products.Commands.CreateProductTerm;

public record CreateProductTermResponse(Guid Id);
[AuthorizePermission(Permissions.Accounting.AddProductTerm)]
public record CreateProductTermCommand : IRequest<Result<CreateProductTermResponse>>
{
    public LocalizableTextInputDto Name { get; init; } = default!;
}

public class CreateProductTermCommandHandler : IRequestHandler<CreateProductTermCommand, Result<CreateProductTermResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public CreateProductTermCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper  = mapper;
    }

    public async Task<Result<CreateProductTermResponse>> Handle(CreateProductTermCommand request, CancellationToken cancellationToken)
    {
        var nameExists = await _context.GetSet<Novologs.Domain.Entities.ProductTerm>()
            .AnyAsync(t => t.Name.Value == request.Name.Value && !t.IsDeleted, cancellationToken);

        if (nameExists)
            return Result<CreateProductTermResponse>.Failure("PTERM_409_DUPLICATE", $"A product term with name '{request.Name.Value}' already exists.");

        var nameEntity = _mapper.Map<Novologs.Domain.Entities.LocalizableText>(request.Name);

        var term = new Novologs.Domain.Entities.ProductTerm
        {
            Name = nameEntity
        };

        await _context.GetSet<Novologs.Domain.Entities.ProductTerm>().AddAsync(term, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<CreateProductTermResponse>.Success(new CreateProductTermResponse(term.Id));
    }
}
