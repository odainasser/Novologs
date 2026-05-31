using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class UserWorkStatusConfiguration : IEntityTypeConfiguration<UserWorkStatus>
{
    public void Configure(EntityTypeBuilder<UserWorkStatus> builder)
    {
        builder.HasOne(uws => uws.User)
            .WithMany(u => u.UserWorkStatuses)
            .HasForeignKey(uws => uws.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(uws => uws.WorkStatus)
            .WithMany()
            .HasForeignKey(uws => uws.WorkStatusId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
