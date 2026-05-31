using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class UserLoginInfoConfiguration : IEntityTypeConfiguration<UserLoginInfo>
{
    public void Configure(EntityTypeBuilder<UserLoginInfo> builder)
    {
        builder.HasOne(uli => uli.User)
            .WithMany(u => u.UserLoginInfos)
            .HasForeignKey(uli => uli.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
