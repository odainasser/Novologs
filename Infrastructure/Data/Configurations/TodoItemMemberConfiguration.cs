using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class TodoItemMemberConfiguration : IEntityTypeConfiguration<TodoItemMember>
{
    public void Configure(EntityTypeBuilder<TodoItemMember> builder)
    {
        builder.HasOne(tim => tim.Todo)
            .WithMany(ti => ti.Members)
            .HasForeignKey(tim => tim.TodoId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(tim => tim.Member)
            .WithMany()
            .HasForeignKey(tim => tim.MemberId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
