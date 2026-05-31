using Finbuckle.MultiTenant;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Novologs.Api;
using Novologs.Application;
using Novologs.Domain.Entities;
using Novologs.Infrastructure;
using Novologs.Infrastructure.Data;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((context, config) => config
    .ReadFrom.Configuration(context.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "Novologs.Api")
    .WriteTo.Console());

// Default the seeding-data path to <ContentRoot>/Seeding.json unless explicitly configured.
builder.Configuration["DefaultsJsonPath"] ??=
    Path.Combine(builder.Environment.ContentRootPath, "Seeding.json");

// Clean Architecture layers.
builder.AddApplicationServices();
builder.AddInfrastructureServices();
builder.AddApiServices();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();

app.UseCors();
app.UseAuthentication();
app.UseMultiTenant();   // must run AFTER authentication so the claim strategy can read JWT claims
app.UseAuthorization();

// Module minimal-API endpoints.
app.MapEndpoints();

// DEV-only: provision the default tenant + a SuperAdmin login and seed all module reference data.
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var sp = scope.ServiceProvider;
    var userManager = sp.GetRequiredService<UserManager<TenantUser>>();
    var db = sp.GetRequiredService<ApplicationDbContext>();
    var initialiser = sp.GetRequiredService<TenantDbContextInitialiser>();

    // Apply any pending migrations first so all tables exist (no-op when already up to date).
    await initialiser.InitialiseAsync();

    // Default tenant so Finbuckle resolves a tenant context for single-DB.
    if (!await db.Set<AppTenantInfo>().AnyAsync(t => t.Identifier == "default"))
    {
        db.Set<AppTenantInfo>().Add(new AppTenantInfo
        {
            Identifier = "default",
            Name = "Default",
            SeatCount = 100,
            PaymentApproval = true,
            Policy = null
        });
        await db.SaveChangesAsync();
    }

    // Seed every module: permissions, roles, SuperAdmin permissions, and JSON-driven reference data
    // (task statuses, priorities, categories, currencies, departments, designations, lookups, ...).
    await initialiser.SeedAsync();

    // Dev SuperAdmin login (SuperAdmin role is created by the seeder and granted all permissions).
    var admin = await userManager.FindByEmailAsync("administrator@localhost");
    if (admin is null)
    {
        admin = new TenantUser
        {
            UserName = "administrator@localhost",
            Email = "administrator@localhost",
            EmailConfirmed = true,
            FullName = "Administrator",
            Country = "UAE",
            Code = "ADMIN_INIT"
        };
        var result = await userManager.CreateAsync(admin, "Administrator1!");
        if (result.Succeeded)
            await userManager.AddToRoleAsync(admin, "SuperAdmin");
        else
            Log.Warning("Admin seed failed: {Errors}", string.Join("; ", result.Errors.Select(e => e.Description)));
    }
    else if (!await userManager.IsInRoleAsync(admin, "SuperAdmin"))
    {
        await userManager.AddToRoleAsync(admin, "SuperAdmin");
    }

    // Root document folders for the admin.
    if (admin is not null)
        await initialiser.SeedFoldersAsync(admin.Id);
}

app.Run();

// Exposed for integration testing (WebApplicationFactory).
public partial class Program;
