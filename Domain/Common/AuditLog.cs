namespace Novologs.Domain.Common;

/// <summary>
/// Represents a single field-level change recorded in the audit trail.
/// Stored in the AuditLog table within each tenant database.
/// </summary>
public class AuditLog
{
    public long Id { get; set; }

    /// <summary>Short CLR type name of the entity, e.g. "Department"</summary>
    public string EntityName { get; set; } = string.Empty;

    /// <summary>Primary key of the entity (as string)</summary>
    public string EntityId { get; set; } = string.Empty;

    /// <summary>Created | Updated | Deleted</summary>
    public string Action { get; set; } = string.Empty;

    /// <summary>Name of the changed property (null for Created/Deleted row summary)</summary>
    public string? PropertyName { get; set; }

    /// <summary>Value before the change (null for Created)</summary>
    public string? OldValue { get; set; }

    /// <summary>Value after the change (null for Deleted)</summary>
    public string? NewValue { get; set; }

    /// <summary>User Id who made the change</summary>
    public string? ChangedBy { get; set; }

    public DateTimeOffset ChangedAt { get; set; }
}
