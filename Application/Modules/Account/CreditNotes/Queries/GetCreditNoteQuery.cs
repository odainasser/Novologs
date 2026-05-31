using Novologs.Application.Modules.Account.CreditNotes.DTOs;
using Novologs.Application.Modules.Account.CreditNotes.Interfaces;
using Microsoft.EntityFrameworkCore;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Account.CreditNotes.Queries.GetCreditNote;

[AuthorizePermission(Permissions.Accounting.ReadCreditNote)]
public record GetCreditNoteQuery(int Id) : IRequest<Result<CreditNoteDto>>;

public class GetCreditNoteQueryHandler : IRequestHandler<GetCreditNoteQuery, Result<CreditNoteDto>>
{
    private readonly ICreditNoteRepository _repository;
    private readonly IMapper _mapper;
    private readonly ITenantDbContext _context;

    public GetCreditNoteQueryHandler(ICreditNoteRepository repository, IMapper mapper, ITenantDbContext context)
    {
        _repository = repository;
        _mapper     = mapper;
        _context    = context;
    }

    public async Task<Result<CreditNoteDto>> Handle(GetCreditNoteQuery request, CancellationToken cancellationToken)
    {
        var note = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (note is null)
            return Result<CreditNoteDto>.Failure("CN_404_NOT_FOUND", $"Credit note with ID {request.Id} was not found.");

        var dto = _mapper.Map<CreditNoteDto>(note);

        // Enrich Client
        var client = await _context.GetSet<Novologs.Domain.Entities.Client>()
            .AsNoTracking()
            .Where(c => c.Id == note.ClientId && !c.IsDeleted)
            .Select(c => new ClientSummaryDto
            {
                Id              = c.Id,
                Name            = c.Name,
                Code            = c.Code,
                Email           = c.Email,
                Phonenumber     = c.Phonenumber,
                ProfileImageUrl = c.LogoFile != null ? c.LogoFile.Url : null,
            })
            .FirstOrDefaultAsync(cancellationToken);
        dto.Client = client;

        // Enrich CreatedByUser
        if (Guid.TryParse(note.CreatedBy, out var creatorId))
        {
            var user = await _context.GetSet<Novologs.Domain.Entities.TenantUser>()
                .AsNoTracking()
                .Where(u => u.Id == creatorId)
                .Select(u => new UserSummaryDto
                {
                    Id              = u.Id,
                    FullName        = u.FullName,
                    Email           = u.Email,
                    UserName        = u.UserName,
                    ProfileImageUrl = u.ProfileImageFile != null ? u.ProfileImageFile.Url : null,
                })
                .FirstOrDefaultAsync(cancellationToken);
            dto.CreatedByUser = user;
        }

        // Resolve unit names
        var rawItemUnitMap = note.Items
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

        return Result<CreditNoteDto>.Success(dto);
    }
}
