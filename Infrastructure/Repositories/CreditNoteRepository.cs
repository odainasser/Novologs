using System.Text.RegularExpressions;
using Novologs.Application.Modules.Account.CreditNotes.Interfaces;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Repositories;

public class CreditNoteRepository : ICreditNoteRepository
{
    private readonly ITenantDbContext _context;

    public CreditNoteRepository(ITenantDbContext context)
    {
        _context = context;
    }

    public async Task<CreditNote?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        => await _context.GetSet<CreditNote>()
            .Include(n => n.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p!.Name)
                        .ThenInclude(n => n.LocalizedStrings)
            .Include(n => n.Attachments)
            .FirstOrDefaultAsync(n => n.Id == id && !n.IsDeleted, cancellationToken);

    public async Task<int> AddAsync(CreditNote note, CancellationToken cancellationToken = default)
    {
        note.NoteNumber = await GenerateNextNoteNumberAsync(cancellationToken);
        await _context.GetSet<CreditNote>().AddAsync(note, cancellationToken);

        const int maxRetries = 5;
        for (var attempt = 0; attempt < maxRetries; attempt++)
        {
            try
            {
                await _context.SaveChangesAsync(cancellationToken);
                return note.Id;
            }
            catch (DbUpdateException ex)
                when (attempt < maxRetries - 1 &&
                      ex.InnerException is PostgresException { SqlState: "23505", ConstraintName: "IX_CreditNotes_NoteNumber" })
            {
                note.NoteNumber = await GenerateNextNoteNumberAsync(cancellationToken);
            }
        }

        throw new InvalidOperationException("Failed to generate a unique credit note number after multiple retries.");
    }

    private async Task<string> GenerateNextNoteNumberAsync(CancellationToken cancellationToken)
    {
        const string prefix = "CN-";
        var rx = new Regex(@"^CN-(\d+)$");

        var existing = await _context.GetSet<CreditNote>()
            .Where(n => EF.Functions.Like(n.NoteNumber, prefix + "%"))
            .Select(n => n.NoteNumber)
            .ToListAsync(cancellationToken);

        var maxSeq = 0;
        foreach (var num in existing)
        {
            var m = rx.Match(num);
            if (m.Success && int.TryParse(m.Groups[1].Value, out var v))
                maxSeq = Math.Max(maxSeq, v);
        }

        return $"{prefix}{(maxSeq + 1).ToString().PadLeft(4, '0')}";
    }

    public async Task UpdateAsync(CreditNote note, CancellationToken cancellationToken = default)
    {
        _context.GetSet<CreditNote>().Update(note);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
