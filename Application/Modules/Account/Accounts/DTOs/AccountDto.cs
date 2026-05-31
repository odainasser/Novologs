using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.Accounts.DTOs;

public class AccountDto
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
    public bool HasChildren { get; set; }
    public bool IsActive { get; set; }
    public bool IsSubcategory { get; set; }
    public DateTimeOffset Created { get; set; }
    public List<Novologs.Application.Modules.Account.Transactions.DTOs.TransactionDto> Transactions { get; set; } = new();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.Account, AccountDto>()
                .ForMember(d => d.ParentName, opt => opt.MapFrom(s => s.ParentAccount != null ? s.ParentAccount.Name : null))
                .ForMember(d => d.HasChildren, opt => opt.MapFrom(s => s.ChildAccounts.Any()))
                .ForMember(d => d.FullPath, opt => opt.Ignore()) // Will be set manually in queries
                .ForMember(d => d.Transactions, opt => opt.Ignore()); // Populated in queries when needed
        }
    }
}
