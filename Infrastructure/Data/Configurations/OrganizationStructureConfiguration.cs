using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Novologs.Domain.Entities;

namespace Novologs.Infrastructure.Data.Configurations;

public class OrganizationStructureConfiguration : IEntityTypeConfiguration<OrganizationStructure>
{
    public void Configure(EntityTypeBuilder<OrganizationStructure> builder)
    {
        builder.HasOne(d => d.ParentStructure)
            .WithMany(d => d.Children)
            .HasForeignKey(d => d.ParentStructureId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(d => d.Department)
            .WithMany()
            .HasForeignKey(d => d.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(d => d.Employee)
            .WithMany()
            .HasForeignKey(d => d.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
