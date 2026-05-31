using Novologs.Application.User.Dto;
using Novologs.Domain.Entities;

namespace Novologs.Application.Hierarchy.Utilities;

public class HierarchyWithLevelAndParentModel : TenantUserDto
{
    public TenantUser? Parent { get; set; }
    public OrganizationStructure? node { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<TenantUser, HierarchyWithLevelAndParentModel>();
        }
    }
}
