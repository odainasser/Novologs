namespace Novologs.Domain.Common;

public interface ISoftDeletable
{
    bool IsDeleted { get; set; }

    DateTime? DeletedOnDate { get; set; }
    string? DeletedBy { get; set; }
}