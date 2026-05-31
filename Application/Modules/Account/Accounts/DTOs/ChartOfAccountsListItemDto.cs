using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.Accounts.DTOs;

public class ChartOfAccountsListItemDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = default!;
    public string Name { get; set; } = default!;
    public AccountType AccountType { get; set; }
    public AccountCategory AccountCategory { get; set; }
    public int Level { get; set; }
    public Guid? ParentAccountId { get; set; }
    public string? ParentName { get; set; }
    public string? FullPath { get; set; }

    /// <summary>Name of the Level-1 ancestor (root category, e.g. "Assets").</summary>
    public string? Level1Name { get; set; }

    /// <summary>Name of the Level-2 ancestor (e.g. "Current Assets").</summary>
    public string? Level2Name { get; set; }

    /// <summary>Name of the Level-3 ancestor (e.g. "Bank Accounts").</summary>
    public string? Level3Name { get; set; }

    /// <summary>Name of the Level-4 ancestor (e.g. "Bank ADCB").</summary>
    public string? Level4Name { get; set; }

    /// <summary>Name of the Level-5 ancestor / leaf (e.g. "Shahina").</summary>
    public string? Level5Name { get; set; }

    /// <summary>
    /// True when this node has child accounts, meaning it is a category/group.
    /// False when it is a leaf (postable ledger account).
    /// </summary>
    public bool HasChildren { get; set; }
    public bool IsActive { get; set; }
    public bool IsSubcategory { get; set; }
    public DateTimeOffset Created { get; set; }

    /// <summary>Opening balance debit amount.</summary>
    public decimal OpeningDebit { get; set; }

    /// <summary>Opening balance credit amount.</summary>
    public decimal OpeningCredit { get; set; }
    public decimal TotalDebit { get; set; }
    public decimal TotalCredit { get; set; }
    public decimal TotalValue { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.Account, ChartOfAccountsListItemDto>()
                .ForMember(d => d.ParentName, opt => opt.MapFrom(s => s.ParentAccount != null ? s.ParentAccount.Name : null))
                .ForMember(d => d.FullPath, opt => opt.Ignore())
                .ForMember(d => d.Level1Name, opt => opt.Ignore())
                .ForMember(d => d.Level2Name, opt => opt.Ignore())
                .ForMember(d => d.Level3Name, opt => opt.Ignore())
                .ForMember(d => d.Level4Name, opt => opt.Ignore())
                .ForMember(d => d.Level5Name, opt => opt.Ignore());
        }
    }
}
