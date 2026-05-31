using Microsoft.AspNetCore.Identity;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;

namespace Novologs.Application.User.Commands.UpdateUser;

public class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator(
        ITenantDbContext context,
        RoleManager<IdentityRole<Guid>> roleManager,
        UserManager<TenantUser> userManager,
        IUser user)
    {
        RuleFor(v => v.Email)
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
            .MustAsync(async (model, code, cancellationToken) =>
            {
                if (string.IsNullOrEmpty(code)) return true;
                return !await context.GetSet<TenantUser>()
                    .AnyAsync(u => u.Code == code && u.Id != model.UserId, cancellationToken);
            }).WithMessage("Code already exists.");

        RuleFor(v => v.FullName)
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
            .MustAsync(async (model, email, cancellationToken) =>
            {
                return string.IsNullOrWhiteSpace(email) || !await context.GetSet<TenantUser>()
                    .AnyAsync(u => u.Email == email && u.Id != model.UserId, cancellationToken);
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
                if (roles == null) return true;
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
        RuleFor(v => v.UserId)
            .NotEmpty().WithMessage("UserId is required.")
            .MustAsync(async (userId, cancellationToken) =>
            {
                return await context.GetSet<TenantUser>().AnyAsync(u => u.Id == userId, cancellationToken);
            }).WithMessage("UserId is not valid.");
        RuleFor(v => v)
            .MustAsync(async (model, cancellationToken) =>
            {
                if (model.HierarchyParentId == null) return true;
                var organizationStructure = await context.GetSet<OrganizationStructure>()
                    .FirstOrDefaultAsync(d => d.Id == model.HierarchyParentId, cancellationToken);
                if (organizationStructure == null) return false;
                if (organizationStructure.EmployeeId == model.UserId) return false;
                return true;
            }).WithMessage("HierarchyParentId can't be the same as the user id.");

        //check profile image sid is valid and is image
        RuleFor(v => v.ProfileImageFileId)
            .MustAsync(async (profileImageFileId, cancellationToken) =>
            {
                if (!profileImageFileId.HasValue) return true;
                var file = await context.GetSet<Folder>()
                    .FirstOrDefaultAsync(f => f.Id == profileImageFileId, cancellationToken);
                return file != null && file.IsFile && file.MimeType != null && file.MimeType.StartsWith("image/");
            }).WithMessage("ProfileImageFileId is not valid or is not an image file.");

        //prevent current supper admin from removing super admin role from him self
        RuleFor(v => v.Roles)
            .MustAsync(async (model, roles, cancellationToken) =>
            {
                var userObj = await context.GetSet<TenantUser>()
                    .FirstOrDefaultAsync(u => u.Id == model.UserId, cancellationToken);
                if (user.IdGuid == model.UserId && userObj != null &&
                    await userManager.IsInRoleAsync(userObj, "SuperAdmin"))
                {
                    if (roles != null && !roles.Contains("SuperAdmin"))
                    {
                        return false;
                    }
                }
                return true;
            }).WithMessage("You cannot remove the 'SuperAdmin' role from yourself.");
    }
}
