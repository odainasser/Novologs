namespace Novologs.Domain.Enums;

[Flags]
public enum LeadMemberPermission : short
{
    None = 0,
    View = 1,
    Update = 2,
    Delete = 4,
    ChangeStatus = 8,
    ManageMembers = 16
}
