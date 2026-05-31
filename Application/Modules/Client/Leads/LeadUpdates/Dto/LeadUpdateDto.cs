namespace Novologs.Application.Modules.Client.Leads.LeadUpdates.Dto;

public class LeadUpdateDto
{
    public Guid Id { get; set; }
    public Guid LeadId { get; set; }
    public string Description { get; set; } = null!;
    public string? Status { get; set; }
    public DateTimeOffset? Created { get; set; }
    public DateTimeOffset? LastModified { get; set; }

    public Guid CreatorId { get; set; }
    public string? CreatedByName { get; set; }
    public string? CreatedByProfileImage { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<Novologs.Domain.Entities.LeadUpdate, LeadUpdateDto>()
                .ForMember(dest => dest.CreatedByName,
                    opt => opt.MapFrom(src => src.Creator != null ? src.Creator.FullName : null))
                .ForMember(dest => dest.CreatedByProfileImage,
                    opt => opt.MapFrom(src => src.Creator != null && src.Creator.ProfileImageFile != null
                        ? src.Creator.ProfileImageFile.Url
                        : null));
        }
    }
}
