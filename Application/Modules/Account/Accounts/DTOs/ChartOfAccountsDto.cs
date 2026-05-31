using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Account.Accounts.DTOs;

public class ChartOfAccountsDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = default!;
    public string Name { get; set; } = default!;
    public AccountType AccountType { get; set; }
    public AccountCategory AccountCategory { get; set; }
    public int Level { get; set; }
    public Guid? ParentAccountId { get; set; }
    public bool IsActive { get; set; }
    public bool IsSubcategory { get; set; }
    public decimal OpeningDebit { get; set; }
    public decimal OpeningCredit { get; set; }
    public decimal TotalDebit { get; set; }
    public decimal TotalCredit { get; set; }
    public List<ChartOfAccountsDto> Children { get; set; } = new();

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.Account, ChartOfAccountsDto>()
                .ForMember(d => d.Children, opt => opt.MapFrom(s => s.ChildAccounts));
        }
    }
}
