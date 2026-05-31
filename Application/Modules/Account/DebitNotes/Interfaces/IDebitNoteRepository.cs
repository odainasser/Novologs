using Novologs.Domain.Entities;

namespace Novologs.Application.Modules.Account.DebitNotes.Interfaces;

public interface IDebitNoteRepository
{
    Task<DebitNote?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<int> AddAsync(DebitNote note, CancellationToken cancellationToken = default);
    Task UpdateAsync(DebitNote note, CancellationToken cancellationToken = default);
}
