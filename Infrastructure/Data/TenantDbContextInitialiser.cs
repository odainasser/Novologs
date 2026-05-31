using System.Reflection;
using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Constants;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;
using Novologs.Infrastructure.Data.Seeding;
using Npgsql;
using ApplicationConstants = Novologs.Application.Tenant.Constants;
using TaskStatus = Novologs.Domain.Entities.TaskStatus;

namespace Novologs.Infrastructure.Data;

/// <summary>
/// Single-DB database initialiser. Applies EF Core migrations against the single
/// <see cref="ApplicationDbContext"/> and seeds default data (permissions, roles,
/// departments, currencies, chart of accounts, root folders, ...).
/// </summary>
public class TenantDbContextInitialiser
{
    private readonly IConfiguration _configuration;
    private readonly ApplicationDbContext _context;
    private readonly ILogger<TenantDbContextInitialiser> _logger;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly UserManager<TenantUser> _userManager;

    public TenantDbContextInitialiser(
        ILogger<TenantDbContextInitialiser> logger,
        ApplicationDbContext context,
        UserManager<TenantUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        IConfiguration configuration)
    {
        _logger = logger;
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
    }

    public async Task InitialiseAsync()
    {
        try
        {
            await ApplyMigrationsResilientlyAsync(_context, _logger);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initialising the database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        try
        {
            await TrySeedJsonAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    internal async Task TrySeedJsonAsync()
    {
        var seedingData = await LoadSeedingDataAsync();
        if (seedingData == null) return;

        await SeedLocalizedEntitiesAsync<TaskPriority, PrioritySeed>(seedingData.Priorities);
        await SeedLocalizedEntitiesAsync<TaskCategory, CategorySeed>(seedingData.Categories);
        await SeedLocalizedEntitiesAsync<LeadRejectionReason, LocalizedEntitySeed>(seedingData.LeadRejectionReasons);
        await SeedLocalizedEntitiesAsync<LeadSaleStatus, LocalizedEntitySeed>(seedingData.LeadSaleStatuses);
        await SeedLocalizedEntitiesAsync<LeadSource, LocalizedEntitySeed>(seedingData.LeadSources);
        await SeedLocalizedEntitiesAsync<VendorContractType, LocalizedEntitySeed>(seedingData.VendorContractTypes);
        await SeedLocalizedEntitiesAsync<VendorContractStatus, LocalizedEntitySeed>(seedingData.VendorContractStatuses);
        await SeedLocalizedEntitiesAsync<ProjectTaskType, LocalizedEntitySeed>(seedingData.ProjectTaskTypes);
        await SeedLocalizedEntitiesAsync<ProjectGoal, LocalizedEntitySeed>(seedingData.ProjectGoals);
        await SeedLocalizedEntitiesAsync<ProjectInitiative, LocalizedEntitySeed>(seedingData.ProjectInitiatives);
        await SeedLocalizedEntitiesAsync<WorkStatus, WorkStatusSeed>(seedingData.WorkStatuses);

        await SeedPermissionsAsync();
        await SeedRolesAsync();
        await SeedRolePermissionsAsync(seedingData.RolesMapping);
        await SeedDepartmentsAsync(seedingData.Departments);
        await SeedDesignationsAsync(seedingData.Designations);
        await SeedUsersAsync(seedingData.Users);

        await SeedTaskStatusAsync(seedingData.Statuses);
        await SeedCurrenciesAsync(seedingData.Currencies);
        await SeedSettingsAsync(seedingData.Settings);
        await SeedDefaultCurrencySettingAsync();

        await AccountSeeder.SeedDefaultChartOfAccountsAsync(_context, CancellationToken.None);
    }

    public async Task SeedFoldersAsync(Guid adminId)
    {
        var rootNames = new[]
        {
            ApplicationConstants.System,
            ApplicationConstants.General,
            ApplicationConstants.Shared,
            ApplicationConstants.Deleted
        };
        var roots = new Dictionary<string, Folder>();

        foreach (var rootName in rootNames)
        {
            var root = await _context.GetSet<Folder>()
                .FirstOrDefaultAsync(f => f.Type == FolderType.General
                                       && f.Name == rootName
                                       && f.ParentFolderId == null);
            if (root == null)
            {
                root = new Folder(Guid.NewGuid())
                {
                    Name = rootName,
                    Type = FolderType.General,
                    ParentFolderId = null,
                    IsFile = false,
                    CreatorId = adminId
                };
                _context.GetSet<Folder>().Add(root);
                await _context.SaveChangesAsync();
            }
            roots[rootName] = root;
        }

        foreach (var (folderName, rootName) in ApplicationConstants.FolderRootMapping)
        {
            var parent = roots[rootName];
            if (!await _context.GetSet<Folder>()
                    .AnyAsync(f => f.Name == folderName && f.ParentFolderId == parent.Id))
            {
                _context.GetSet<Folder>().Add(new Folder(Guid.NewGuid())
                {
                    Name = folderName,
                    Type = FolderType.General,
                    ParentFolderId = parent.Id,
                    IsFile = false,
                    CreatorId = adminId
                });
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task<SeedingData?> LoadSeedingDataAsync()
    {
        string jsonFilePath = _configuration.GetValue<string>("DefaultsJsonPath") ?? "";

        if (!File.Exists(jsonFilePath))
        {
            _logger.LogWarning("Seeding.json file not found at {FilePath}", jsonFilePath);
            return null;
        }

        var json = await File.ReadAllTextAsync(jsonFilePath);
        var seedingData = JsonSerializer.Deserialize<SeedingData>(json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (seedingData == null)
        {
            _logger.LogError("Failed to deserialize Seeding.json");
            return null;
        }

        return seedingData;
    }

    private async Task SeedPermissionsAsync()
    {
        var allPermissions = typeof(Permissions)
            .GetNestedTypes()
            .SelectMany(c => c.GetFields(BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy))
            .Where(fi => fi.IsLiteral && !fi.IsInitOnly && fi.FieldType == typeof(string))
            .Select(fi => fi.GetValue(null) as string)
            .ToList();

        foreach (var permissionName in allPermissions)
        {
            if (string.IsNullOrWhiteSpace(permissionName)) continue;
            if (!await _context.Set<Permission>().AnyAsync(p => p.Name == permissionName))
            {
                var permission = new Permission(Guid.NewGuid()) { Name = permissionName };
                _context.Set<Permission>().Add(permission);
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedRolesAsync()
    {
        var roles = typeof(Permissions.Roles)
            .GetFields(BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy)
            .Where(fi => fi.IsLiteral && !fi.IsInitOnly && fi.FieldType == typeof(string))
            .Select(fi => new RoleSetting { Name = fi.GetValue(null) as string ?? string.Empty })
            .ToList();

        foreach (var roleSetting in roles)
        {
            if (string.IsNullOrWhiteSpace(roleSetting.Name)) continue;
            if (!await _roleManager.RoleExistsAsync(roleSetting.Name))
            {
                var role = new IdentityRole<Guid>(roleSetting.Name);
                await _roleManager.CreateAsync(role);
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedRolePermissionsAsync(List<RoleMappingSetting>? rolesWithPermissions)
    {
        if (rolesWithPermissions == null) return;
        foreach (var roleSetting in rolesWithPermissions)
        {
            if (string.IsNullOrWhiteSpace(roleSetting.Name)) continue;
            var role = await _roleManager.FindByNameAsync(roleSetting.Name);
            if (role == null) continue;

            foreach (var permissionName in roleSetting.Permission ?? [])
            {
                var permission = await _context.Set<Permission>().FirstOrDefaultAsync(p => p.Name == permissionName);
                if (permission == null) continue;

                if (!await _context.Set<RolePermission>()
                        .AnyAsync(rp => rp.RoleId == role.Id && rp.PermissionId == permission.Id))
                {
                    var rolePermission = new RolePermission(Guid.NewGuid())
                    {
                        RoleId = role.Id, PermissionId = permission.Id
                    };
                    _context.Set<RolePermission>().Add(rolePermission);
                }
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedDepartmentsAsync(List<DepartmentSetting>? departments)
    {
        if (departments == null) return;

        foreach (var deptSetting in departments)
        {
            if (string.IsNullOrWhiteSpace(deptSetting.Name)) continue;
            if (!await _context.Set<Department>().AnyAsync(d => d.Name.Value == deptSetting.Name))
            {
                var department = new Department(Guid.NewGuid())
                {
                    Name = new LocalizableText(Guid.NewGuid()) { Value = deptSetting.Name }
                };
                _context.Set<Department>().Add(department);
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedDesignationsAsync(List<DesignationSetting>? designations)
    {
        if (designations == null) return;

        foreach (var desgSetting in designations)
        {
            if (string.IsNullOrWhiteSpace(desgSetting.Name)) continue;
            if (!await _context.Set<Designation>().AnyAsync(d => d.Name.Value == desgSetting.Name))
            {
                var designation = new Designation(Guid.NewGuid())
                {
                    Name = new LocalizableText(Guid.NewGuid()) { Value = desgSetting.Name }
                };
                _context.Set<Designation>().Add(designation);
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedUsersAsync(List<UserSetting>? users)
    {
        if (users == null) return;

        foreach (var userSetting in users)
        {
            if (string.IsNullOrWhiteSpace(userSetting.UserName) || string.IsNullOrWhiteSpace(userSetting.Password))
            {
                continue;
            }

            if (_userManager.Users.All(u => u.UserName != userSetting.UserName))
            {
                var department = await _context.Set<Department>()
                    .FirstOrDefaultAsync(d => d.Name.Value == userSetting.Department.Name);
                var designation = await _context.Set<Designation>()
                    .FirstOrDefaultAsync(d => d.Name.Value == userSetting.Designation.Name);

                if (department == null || designation == null) continue;

                var user = new TenantUser
                {
                    FullName = userSetting.FullName,
                    UserName = userSetting.UserName,
                    Email = userSetting.Email,
                    Code = userSetting.EmployeeCode,
                    Country = userSetting.Country,
                    DepartmentId = department.Id,
                    DesignationId = designation.Id,
                    EmailConfirmed = true
                };

                var result = await _userManager.CreateAsync(user, userSetting.Password);
                if (result.Succeeded)
                {
                    var userRoles = userSetting.Roles?.Select(r => r.Name).Where(n => !string.IsNullOrWhiteSpace(n))
                        .ToArray();
                    if (userRoles != null && userRoles.Length > 0)
                        await _userManager.AddToRolesAsync(user, userRoles);
                }
            }
        }
    }

    private async Task SeedLocalizedEntitiesAsync<TEntity, TSeed>(IEnumerable<TSeed>? entities)
        where TEntity : class
        where TSeed : class
    {
        if (entities == null) return;

        var nameProperty = typeof(TSeed).GetProperty("Name");
        if (nameProperty == null) return;

        var dbSet = _context.Set<TEntity>();

        foreach (var entity in entities)
        {
            var nameSeed = nameProperty.GetValue(entity) as LocalizedStringSeed;
            if (nameSeed == null || string.IsNullOrWhiteSpace(nameSeed.en)) continue;

            var entityType = typeof(TEntity);
            var exists = await dbSet.AsQueryable()
                .AnyAsync(e => EF.Property<LocalizableText>(e, "Name").Value == nameSeed.en);

            if (!exists)
            {
                var newEntity = (TEntity)Activator.CreateInstance(entityType, Guid.NewGuid())!;
                var localizableText = new LocalizableText(Guid.NewGuid())
                {
                    Value = nameSeed.en,
                    LocalizedStrings = nameSeed.ar != null
                        ? new List<LocalizedString>()
                        {
                            new LocalizedString(Guid.NewGuid()) { Language = "Ar", Value = nameSeed.ar }
                        }
                        : new List<LocalizedString>()
                };

                entityType.GetProperty("Name")?.SetValue(newEntity, localizableText);
                dbSet.Add(newEntity);
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedCurrenciesAsync(IEnumerable<CurrencySeed>? currencies)
    {
        if (currencies == null) return;

        foreach (var currencySeed in currencies)
        {
            if (string.IsNullOrWhiteSpace(currencySeed.Name?.en) ||
                string.IsNullOrWhiteSpace(currencySeed.Symbol)) continue;

            if (!await _context.Set<Currency>().AnyAsync(c => c.Symbol == currencySeed.Symbol))
            {
                var currency = new Currency(Guid.NewGuid())
                {
                    Symbol = currencySeed.Symbol,
                    Name = new LocalizableText(Guid.NewGuid())
                    {
                        Value = currencySeed.Name.en,
                        LocalizedStrings = currencySeed.Name.ar != null
                            ? new List<LocalizedString>()
                            {
                                new LocalizedString(Guid.NewGuid())
                                {
                                    Language = "Ar", Value = currencySeed.Name.ar
                                }
                            }
                            : new List<LocalizedString>()
                    }
                };
                _context.Set<Currency>().Add(currency);
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedTaskStatusAsync(IEnumerable<TaskStatusSeed>? taskStatuses)
    {
        if (taskStatuses == null) return;

        foreach (var currencySeed in taskStatuses)
        {
            if (string.IsNullOrWhiteSpace(currencySeed.Name?.en) ||
                currencySeed.Status == null) continue;

            if (!await _context.Set<TaskStatus>().AnyAsync(c => c.Status == currencySeed.Status))
            {
                var currency = new TaskStatus(Guid.NewGuid())
                {
                    Status = currencySeed.Status.Value,
                    Color = currencySeed.Color,
                    Name = new LocalizableText(Guid.NewGuid())
                    {
                        Value = currencySeed.Name.en,
                        LocalizedStrings = currencySeed.Name.ar != null
                            ? new List<LocalizedString>()
                            {
                                new LocalizedString(Guid.NewGuid())
                                {
                                    Language = "Ar", Value = currencySeed.Name.ar
                                }
                            }
                            : new List<LocalizedString>()
                    }
                };
                _context.Set<TaskStatus>().Add(currency);
            }
        }

        await _context.SaveChangesAsync();
    }

    private async Task SeedSettingsAsync(List<Setting>? settings)
    {
        if (settings == null) return;

        foreach (var setting in settings)
        {
            if (string.IsNullOrWhiteSpace(setting.Key) || string.IsNullOrWhiteSpace(setting.Value))
            {
                continue;
            }

            if (!await _context.Set<Setting>().AnyAsync(s => s.Key == setting.Key))
            {
                var newSetting = new Setting(Guid.NewGuid()) { Key = setting.Key, Value = setting.Value };
                _context.Set<Setting>().Add(newSetting);
            }
        }

        await _context.SaveChangesAsync();
    }

    internal async Task SeedDefaultCurrencySettingAsync()
    {
        var settingKey = ApplicationConstants.SettingKeys.DefaultCurrency;

        if (await _context.Set<Setting>().AnyAsync(s => s.Key == settingKey))
            return;

        var currency = await _context.Set<Currency>()
                           .FirstOrDefaultAsync(c => c.Symbol == "SAR")
                       ?? await _context.Set<Currency>().FirstOrDefaultAsync();

        if (currency == null) return;

        _context.Set<Setting>().Add(new Setting(Guid.NewGuid())
        {
            Key = settingKey,
            Value = currency.Id.ToString()
        });

        await _context.SaveChangesAsync();
    }

    /// <summary>
    /// Applies EF Core migrations one at a time. If a migration fails because its objects already
    /// exist (or don't exist) in a legacy schema, it is recorded as applied without re-running its SQL.
    /// </summary>
    private static async Task ApplyMigrationsResilientlyAsync(ApplicationDbContext ctx, ILogger logger)
    {
        var pending = (await ctx.Database.GetPendingMigrationsAsync()).ToList();
        if (pending.Count == 0)
            return;

        var migrator = ctx.GetService<IMigrator>();

        foreach (var migrationId in pending)
        {
            try
            {
                await migrator.MigrateAsync(migrationId);
                logger.LogDebug("Applied migration '{Migration}'.", migrationId);
            }
            catch (Exception ex) when (FindPostgresException(ex) is { SqlState: "42P07" or "42701" or "42703" or "42704" } pgEx)
            {
                logger.LogWarning(
                    "Migration '{Migration}' skipped — database objects already exist or do not exist ({SqlState}). " +
                    "Marking as applied in migration history.",
                    migrationId, pgEx.SqlState);
                await MarkMigrationAsAppliedAsync(ctx, migrationId);
            }
        }
    }

    private static PostgresException? FindPostgresException(Exception? ex)
    {
        while (ex != null)
        {
            if (ex is PostgresException pg) return pg;
            if (ex is AggregateException agg)
            {
                foreach (var inner in agg.InnerExceptions)
                {
                    var found = FindPostgresException(inner);
                    if (found != null) return found;
                }
            }
            ex = ex.InnerException;
        }
        return null;
    }

    private static async Task MarkMigrationAsAppliedAsync(ApplicationDbContext ctx, string migrationId)
    {
        var conn = ctx.Database.GetDbConnection();
        var wasOpen = conn.State == System.Data.ConnectionState.Open;
        if (!wasOpen) await conn.OpenAsync();
        try
        {
            await using var createCmd = conn.CreateCommand();
            createCmd.CommandText = """
                CREATE TABLE IF NOT EXISTS "__EFMigrationsHistory" (
                    "MigrationId" character varying(150) NOT NULL,
                    "ProductVersion" character varying(32) NOT NULL,
                    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
                )
                """;
            await createCmd.ExecuteNonQueryAsync();

            await using var insertCmd = conn.CreateCommand();
            insertCmd.CommandText = """
                INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
                VALUES (@id, @ver)
                ON CONFLICT DO NOTHING
                """;
            var p1 = insertCmd.CreateParameter();
            p1.ParameterName = "id";
            p1.Value = migrationId;
            insertCmd.Parameters.Add(p1);
            var p2 = insertCmd.CreateParameter();
            p2.ParameterName = "ver";
            p2.Value = typeof(DbContext).Assembly
                .GetCustomAttribute<AssemblyInformationalVersionAttribute>()
                ?.InformationalVersion ?? "9.0.0";
            insertCmd.Parameters.Add(p2);
            await insertCmd.ExecuteNonQueryAsync();
        }
        finally
        {
            if (!wasOpen) conn.Close();
        }
    }
}

internal class RoleSetting
{
    public string Name { get; set; } = string.Empty;
    public IEnumerable<string>? Permission { get; set; }
}

internal class RoleMappingSetting
{
    public string Name { get; set; } = string.Empty;
    public IEnumerable<string>? Permission { get; set; }
}

internal class DepartmentSetting
{
    public string Name { get; set; } = string.Empty;
}

internal class DesignationSetting
{
    public string Name { get; set; } = string.Empty;
}

internal class UserSetting
{
    public string FullName { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string EmployeeCode { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public DepartmentSetting Department { get; set; } = new DepartmentSetting();
    public DesignationSetting Designation { get; set; } = new DesignationSetting();
    public List<RoleSetting> Roles { get; set; } = new List<RoleSetting>();
}

internal class SeedingData
{
    public List<string>? Permissions { get; set; }
    public List<RoleSetting>? Roles { get; set; }
    public List<RoleMappingSetting>? RolesMapping { get; set; }
    public List<DepartmentSetting>? Departments { get; set; }
    public List<DesignationSetting>? Designations { get; set; }
    public List<UserSetting>? Users { get; set; }
    public IEnumerable<PrioritySeed>? Priorities { get; set; }
    public IEnumerable<CategorySeed>? Categories { get; set; }
    public IEnumerable<TaskStatusSeed>? Statuses { get; set; }
    public List<Setting>? Settings { get; set; }
    public IEnumerable<CurrencySeed>? Currencies { get; set; }
    public IEnumerable<LocalizedEntitySeed>? LeadRejectionReasons { get; set; }
    public IEnumerable<LocalizedEntitySeed>? LeadSaleStatuses { get; set; }
    public IEnumerable<LocalizedEntitySeed>? LeadSources { get; set; }

    public IEnumerable<LocalizedEntitySeed>? VendorContractTypes { get; set; }
    public IEnumerable<LocalizedEntitySeed>? VendorContractStatuses { get; set; }
    public IEnumerable<LocalizedEntitySeed>? ProjectTaskTypes { get; set; }
    public IEnumerable<LocalizedEntitySeed>? ProjectGoals { get; set; }
    public IEnumerable<LocalizedEntitySeed>? ProjectInitiatives { get; set; }
    public IEnumerable<WorkStatusSeed>? WorkStatuses { get; set; }
}

internal class TaskStatusSeed
{
    public ProjectTaskStatus? Status { get; set; }
    public LocalizedStringSeed? Name { get; set; }
    public string? Color { get; set; }
}

internal class WorkStatusSeed
{
    public LocalizedStringSeed? Name { get; set; }
}

internal class CategorySeed
{
    public LocalizedStringSeed? Name { get; set; }
}

internal class PrioritySeed
{
    public LocalizedStringSeed? Name { get; set; }
}

internal class LocalizedStringSeed
{
    public string? en { get; set; }
    public string? ar { get; set; }
}

internal class LocalizedEntitySeed
{
    public LocalizedStringSeed? Name { get; set; }
}

internal class CurrencySeed
{
    public string? Symbol { get; set; }
    public LocalizedStringSeed? Name { get; set; }
}
