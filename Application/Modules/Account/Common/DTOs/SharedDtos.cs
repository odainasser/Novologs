namespace Novologs.Application.Modules.Account.Common.DTOs;

/// <summary>
/// Canonical localized string entry — shared across all document types.
/// </summary>
public class LocalizedStringItemDto
{
    public string Language { get; set; } = default!;
    public string Value    { get; set; } = default!;
}

/// <summary>
/// Canonical lookup with localized display — used for Terms, OrderType, etc.
/// </summary>
public class LocalizedLookupDto
{
    public Guid   Id    { get; set; }
    public string Value { get; set; } = default!;
    public ICollection<LocalizedStringItemDto> LocalizedStrings { get; set; } = new List<LocalizedStringItemDto>();
}

/// <summary>
/// Canonical user summary — used in CreatedByUser fields.
/// </summary>
public class UserSummaryDto
{
    public Guid    Id              { get; set; }
    public string? FullName        { get; set; }
    public string? Email           { get; set; }
    public string? UserName        { get; set; }
    public string? ProfileImageUrl { get; set; }
}

/// <summary>
/// Canonical vendor summary — used in purchase documents.
/// </summary>
public class VendorSummaryDto
{
    public Guid    Id              { get; set; }
    public string  Name            { get; set; } = default!;
    public string? Code            { get; set; }
    public string? Email           { get; set; }
    public string? Phonenumber     { get; set; }
    public string? ProfileImageUrl { get; set; }
}

/// <summary>
/// Canonical client summary — used in sales documents.
/// </summary>
public class ClientSummaryDto
{
    public Guid    Id              { get; set; }
    public string  Name            { get; set; } = default!;
    public string? Code            { get; set; }
    public string? Email           { get; set; }
    public string? Phonenumber     { get; set; }
    public string? ProfileImageUrl { get; set; }
}

/// <summary>
/// Canonical product reference — matches PurchaseOrder shape:
/// { id, value, localizedStrings }
/// </summary>
public class ProductSummaryDto
{
    public int    Id    { get; set; }
    public string Value { get; set; } = default!;
    public ICollection<LocalizedStringItemDto> LocalizedStrings { get; set; } = new List<LocalizedStringItemDto>();
}

/// <summary>
/// Canonical unit reference — matches PurchaseOrder shape:
/// { id, value, localizedStrings }
/// </summary>
public class UnitSummaryDto
{
    public Guid   Id    { get; set; }
    public string Value { get; set; } = default!;
    public ICollection<LocalizedStringItemDto> LocalizedStrings { get; set; } = new List<LocalizedStringItemDto>();
}
