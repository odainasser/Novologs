using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class TodoItemConfiguration : IEntityTypeConfiguration<TodoItem>
{
    public void Configure(EntityTypeBuilder<TodoItem> builder)
    {
        builder.HasOne(t => t.LeadUpdate)
            .WithMany(lu => lu.TodoItems)
            .HasForeignKey(t => t.LeadUpdateId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
