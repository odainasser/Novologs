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

// DEV-only: seed a SuperAdmin login on a fresh database so JWT auth is testable.
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var sp = scope.ServiceProvider;
    var roleManager = sp.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
    var userManager = sp.GetRequiredService<UserManager<TenantUser>>();
    var db = sp.GetRequiredService<ApplicationDbContext>();

    // Default tenant so Finbuckle resolves a tenant context for single-DB (model B).
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

    if (!await roleManager.RoleExistsAsync("SuperAdmin"))
        await roleManager.CreateAsync(new IdentityRole<Guid>("SuperAdmin"));

    if (await userManager.FindByEmailAsync("administrator@localhost") is null)
    {
        var admin = new TenantUser
        {
            UserName = "administrator@localhost",
            Email = "administrator@localhost",
            EmailConfirmed = true,
            FullName = "Administrator",
            Country = "UAE"
        };
        var result = await userManager.CreateAsync(admin, "Administrator1!");
        if (result.Succeeded)
            await userManager.AddToRoleAsync(admin, "SuperAdmin");
        else
            Log.Warning("Admin seed failed: {Errors}", string.Join("; ", result.Errors.Select(e => e.Description)));
    }
}

app.Run();

// Exposed for integration testing (WebApplicationFactory).
public partial class Program;
