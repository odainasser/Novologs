using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;
using Novologs.Infrastructure.Services;

namespace Novologs.Application.User.Commands.AddUser;

public class AddUserCommandValidator : AbstractValidator<AddUserCommand>
{
    public AddUserCommandValidator(ITenantDbContext context,
        RoleManager<IdentityRole<Guid>> roleManager,
        ITenantPolicyService tenantPolicyService)
    {

        RuleFor(v => v.Email)
            .NotEmpty().WithMessage("Email is required.")
            .MaximumLength(500).WithMessage("Email must not exceed 500 characters.")
            .EmailAddress().WithMessage("Email is not valid.");
        RuleFor(v => v.Country)
            .MaximumLength(200).WithMessage("Country must not exceed 200 characters.");
        RuleFor(v => v.Language)
            .MaximumLength(200).WithMessage("Language must not exceed 200 characters.");

        RuleFor(v => v.HourlyRate)
            .GreaterThanOrEqualTo(0).WithMessage("HourlyRate must be a non-negative value.");

        RuleFor(v => v.Code)
            .MaximumLength(200).WithMessage("Code must not exceed 200 characters.")
            .MustAsync(async (code, cancellationToken) =>
            {
                if (string.IsNullOrWhiteSpace(code)) return true;
                return !await context.GetSet<TenantUser>()
                    .AnyAsync(u => u.Code == code, cancellationToken);
            }).WithMessage("Code already exists.");

        RuleFor(v => v.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MaximumLength(500).WithMessage("Full name must not exceed 500 characters.");

        RuleFor(v => v.PhoneNumber)
            .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters.");

        RuleFor(v => v.CompanyBranchId)
            .MustAsync(async (companyBranchId, cancellationToken) =>
            {
                return !companyBranchId.HasValue || await context.GetSet<CompanyBranch>()
                    .AnyAsync(cb => cb.Id == companyBranchId, cancellationToken);
            }).WithMessage("CompanyBranchId is not valid.");

        RuleFor(v => v.Email)
            .MustAsync(async (email, cancellationToken) =>
            {
                return !await context.GetSet<TenantUser>().AnyAsync(u => u.Email == email, cancellationToken);
            }).WithMessage("Email already exists.");

        RuleFor(v => v.DesignationId)
            .MustAsync(async (designationId, cancellationToken) =>
            {
                return !designationId.HasValue || await context.GetSet<Designation>()
                    .AnyAsync(d => d.Id == designationId, cancellationToken);
            }).WithMessage("DesignationId is not valid.");
        RuleFor(v => v.DepartmentId)
            .MustAsync(async (departmentId, cancellationToken) =>
            {
                return !departmentId.HasValue ||
                       await context.GetSet<Department>().AnyAsync(d => d.Id == departmentId, cancellationToken);
            }).WithMessage("DepartmentId is not valid.");
        RuleFor(v => v.Roles)
            .MustAsync(async (roles, cancellationToken) =>
            {
                foreach (var role in roles)
                {
                    if (!await roleManager.RoleExistsAsync(role))
                    {
                        return false;
                    }
                }

                return true;
            }).WithMessage("One or more roles are not valid.");

        RuleFor(v => v.HierarchyParentId)
            .MustAsync(async (hierarchyParentId, cancellationToken) =>
            {
                return !hierarchyParentId.HasValue || await context.GetSet<OrganizationStructure>()
                    .AnyAsync(d => d.Id == hierarchyParentId, cancellationToken);
            }).WithMessage("HierarchyParentId is not valid.");
        RuleFor(v => v.ProfileImageFileId)
            .MustAsync(async (profileImageFileId, cancellationToken) =>
            {
                if (!profileImageFileId.HasValue) return true;
                var file = await context.GetSet<Folder>()
                    .FirstOrDefaultAsync(f => f.Id == profileImageFileId, cancellationToken);
                return file != null && file.IsFile && file.MimeType != null && file.MimeType.StartsWith("image/");
            }).WithMessage("ProfileImageFileId is not valid or is not an image file.");

        RuleFor(v => v)
            .CustomAsync(async (command, validationContext, cancellationToken) =>
            {
                var maxUserCountPolicyResult = await tenantPolicyService.ValidateMaxUserCountPolicy();
                if (!maxUserCountPolicyResult.Succeeded)
                {
                    foreach (var error in maxUserCountPolicyResult.Errors)
                    {
                        validationContext.AddFailure(error.Code, error.Description);
                    }
                }
            });
    }
}
