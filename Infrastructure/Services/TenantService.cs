using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Services;
using Novologs.Domain.Constants;
using Novologs.Domain.Entities;
using Novologs.Infrastructure.Data;

namespace Novologs.Infrastructure.Services;

public class TenantService : ITenantService
{
    private readonly ITenantDbContext _context;
    private readonly TenantDbContextInitialiser _initialiser;
    private readonly ILogger<TenantService> _logger;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly UserManager<TenantUser> _userManager;

    public TenantService(
        TenantDbContextInitialiser initialiser,
        ITenantDbContext context,
        UserManager<TenantUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        ILogger<TenantService> logger)
    {
        _initialiser = initialiser;
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _logger = logger;
    }

    public async Task InitTenant(string email, string username, string password, string? fullName, string? country = null, string? phoneNumber = null)
    {
        // Run migrations first to ensure all tables exist (including Accounts)
        await _initialiser.InitialiseAsync();
        
        // Then seed default data
        await _initialiser.SeedAsync();

        var existingUser = await _userManager.FindByNameAsync(username);
        if (existingUser == null)
        {
            var adminDepartment = await _context.GetSet<Department>().FirstOrDefaultAsync(d => d.Name.Value == "Admin");
            var adminDesignation =
                await _context.GetSet<Designation>().FirstOrDefaultAsync(d => d.Name.Value == "Super Admin");

            var tenantUser = new TenantUser
            {
                UserName = username,
                Email = email,
                EmailConfirmed = true,
                FullName = fullName ?? username,
                Code = "ADMIN_INIT",
                Country = string.IsNullOrWhiteSpace(country) ? "Default" : country,
                PhoneNumber = phoneNumber,
                DepartmentId = adminDepartment?.Id,
                DesignationId = adminDesignation?.Id
            };

            var result = await _userManager.CreateAsync(tenantUser, password);

            if (result.Succeeded)
            {
                var adminRoleName = Roles.SuperAdmin;
                if (await _roleManager.RoleExistsAsync(adminRoleName))
                {
                    await _userManager.AddToRoleAsync(tenantUser, adminRoleName);
                }

                await InitStructure(tenantUser);
                await _initialiser.SeedFoldersAsync(tenantUser.Id);
            }
        }
    }

    private async Task InitStructure(TenantUser user)
    {
        var structure = _context.GetSet<OrganizationStructure>();

        var rootStructure =
            new OrganizationStructure(Guid.NewGuid()) { EmployeeId = user.Id, ParentStructureId = null };
        if (structure.Any(s => s.ParentStructureId == null))
        {
            rootStructure = structure.First(s => s.ParentStructureId == null);
        }
        else
        {
            structure.Add(rootStructure);
            await _context.SaveChangesAsync(CancellationToken.None);
        }

        var departments = _context.GetSet<Department>().Include(d => d.Employees).ToList();
        foreach (var department in departments)
        {
            var childStructure = new OrganizationStructure(Guid.NewGuid())
            {
                ParentStructureId = rootStructure.Id, DepartmentId = department.Id
            };
            structure.Add(childStructure);
        }

        await _context.SaveChangesAsync(CancellationToken.None);


        var structureList = await structure.ToListAsync();
        foreach (var department in departments)
        {
            var departmentStructure = _context.GetSet<OrganizationStructure>()
                .FirstOrDefault(s => s.DepartmentId == department.Id);
            foreach (var employee in department.Employees)
            {
                if (structureList.Any(s => s.EmployeeId == employee.Id)) { continue; }

                var employeeStructure = new OrganizationStructure(Guid.NewGuid())
                {
                    ParentStructureId = departmentStructure?.Id, EmployeeId = employee.Id
                };
                structure.Add(employeeStructure);
            }
        }

        await _context.SaveChangesAsync(CancellationToken.None);
    }
}
