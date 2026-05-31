using Novologs.Application.Modules.Document.Documents.Queries.GetDocument;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Document.Documents.Queries.GetPublicDocument;

public record GetPublicDocumentQuery : IRequest<Result<GetPublicDocumentResponse>>
{
    public Guid Id { get; set; }
}

public class GetPublicDocumentResponse : DocumentDto
{
    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.DocumentNode, GetPublicDocumentResponse>();
        }
    }
}

public class GetPublicDocumentQueryValidator : AbstractValidator<GetPublicDocumentQuery>
{
    public GetPublicDocumentQueryValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.DocumentNode>()
                    .AnyAsync(d => d.Id == id, cancellationToken);
            }).WithMessage("Document not found.");
    }
}

public class GetPublicDocumentQueryHandler : IRequestHandler<GetPublicDocumentQuery, Result<GetPublicDocumentResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public GetPublicDocumentQueryHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<GetPublicDocumentResponse>> Handle(GetPublicDocumentQuery request,
        CancellationToken cancellationToken)
    {
        var document = await _context.GetSet<Novologs.Domain.Entities.DocumentNode>()
            .Include(d => d.DocumentVersionList)
            .ThenInclude(v => v.Files)
            .AsNoTracking()
            .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken);

        if (document == null)
        {
            return Result<GetPublicDocumentResponse>.Failure("Document_003", "Document not found");
        }

        if (document.Visibiltiy != Novologs.Domain.Enums.DocumentNodeVisibility.Public)
        {
            return Result<GetPublicDocumentResponse>.Failure("Document_004", "Document is not public");
        }

        var result = _mapper.Map<GetPublicDocumentResponse>(document);
        return Result<GetPublicDocumentResponse>.Success(result);
    }
}
