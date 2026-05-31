using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Account.CreditNotes.Interfaces;

public interface ICreditNoteRepository
{
    Task<CreditNote?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<int> AddAsync(CreditNote note, CancellationToken cancellationToken = default);
    Task UpdateAsync(CreditNote note, CancellationToken cancellationToken = default);
}
