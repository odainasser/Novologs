using Finbuckle.MultiTenant;
using Finbuckle.MultiTenant.Abstractions;
using Finbuckle.MultiTenant.Extensions;
using Finbuckle.MultiTenant.AspNetCore.Extensions;
using Hangfire;
using Hangfire.SqlServer;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Services;
using Novologs.Application.Modules.Account.CreditNotes.Interfaces;
using Novologs.Application.Modules.Account.DebitNotes.Interfaces;
using Novologs.Application.Modules.Account.PurchaseInvoices.Interfaces;
using Novologs.Application.Modules.Account.PurchaseOrders.Interfaces;
using Novologs.Application.Modules.Account.SalesInvoices.Interfaces;
using Novologs.Application.Modules.Account.Transactions.Interfaces;
using Novologs.Application.Modules.Chat.Services;
using Novologs.Application.Modules.Folder.Folders.Commands.AddFolder;
using Novologs.Application.Modules.Tasks.Services;
using Novologs.Domain.Entities;
using Novologs.Infrastructure.Data;
using Novologs.Infrastructure.Identity;
using Novologs.Infrastructure.MessageTemplates;
using Novologs.Infrastructure.Repositories;
using Novologs.Infrastructure.Services;
using Novologs.Infrastructure.Uow;
using Microsoft.Extensions.DependencyInjection.Services;
using SystemLoaders.Services;

namespace Novologs.Infrastructure;

public static class DependencyInjection
{
    /// <summary>
    /// Registers the Infrastructure layer for the single-DB modular monolith: the EF Core context,
    /// multitenancy, Identity, JWT, licensing, file storage, chat, message templates, and the
    /// module repositories/services.
    /// </summary>
    public static void AddInfrastructureServices(this IHostApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString));

        // Single-DB persistence abstractions all resolve to the one ApplicationDbContext.
        builder.Services.AddScoped<ITenantDbContext>(
            provider => provider.GetRequiredService<ApplicationDbContext>());
        builder.Services.AddScoped<IApplicationDbContext>(
            provider => provider.GetRequiredService<ApplicationDbContext>());
        builder.Services.AddScoped<IRegistrationDbContext>(
            provider => provider.GetRequiredService<ApplicationDbContext>());
        builder.Services.AddScoped<ITenantDbContextFactory, TenantDbContextFactory>();

        // Framework services.
        builder.Services.AddHttpContextAccessor();
        builder.Services.AddHttpClient();
        builder.Services.AddMemoryCache();
        builder.Services.AddSingleton(TimeProvider.System);
        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        }).AddJwtBearer();

        builder.Services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
            .Configure<IJwkService, IConfiguration>((options, jwkService, configuration) =>
            {
                options.SaveToken = true;
                options.RequireHttpsMetadata = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidAudience = configuration["JWT:ValidAudience"],
                    ValidIssuer = configuration["JWT:ValidIssuer"],
                    IssuerSigningKey = jwkService.Key,
                    ValidateIssuerSigningKey = true,
                    ClockSkew = TimeSpan.FromMinutes(5)
                };
            });
        builder.Services.AddAuthorizationBuilder();

        // Finbuckle multitenancy backed by the single ApplicationDbContext.
        builder.Services.AddMultiTenant<AppTenantInfo>()
            .WithClaimStrategy("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/system")
            .WithStaticStrategy("default")
            .WithStore<DatabaseTenantStore>(ServiceLifetime.Scoped);
        builder.Services.AddScoped<IMultiTenantStore<AppTenantInfo>, DatabaseTenantStore>();

        // Identity.
        builder.Services
            .AddIdentityCore<TenantUser>(options =>
            {
                options.SignIn.RequireConfirmedAccount = false;
                options.SignIn.RequireConfirmedPhoneNumber = false;
                options.User.RequireUniqueEmail = true;
                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = false;
                options.Password.RequiredLength = 6;
            })
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddSignInManager()
            .AddDefaultTokenProviders();

        // Identity / tenancy services.
        builder.Services.AddSingleton<IJwkService, JwkService>();
        builder.Services.AddTransient<IIdentityService, IdentityService>();
        builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
        builder.Services.AddScoped<ICurrentTenant, CurrentTenant>();
        builder.Services.AddScoped<ITenantService, TenantService>();
        builder.Services.AddScoped<TenantDbContextInitialiser>();

        // Licensing.
        builder.Services.AddScoped<ITenantPolicyService, TenantPolicyService>();
        builder.Services.AddScoped<IPricingPolicyStrategy, LicenseTimeStrategy>();
        builder.Services.AddScoped<IPricingPolicyStrategy, PaymentApprovalStrategy>();
        builder.Services.AddScoped<IMaxUserCountStrategy, MaxUserCountStrategy>();
        builder.Services.AddScoped<ICurentUserCountStrategy, CurentUserCountStrategy>();

        // File storage (single-DB monolith uses local file storage by default).
        var fileStorageProvider = builder.Configuration.GetValue<string>("FileStorage:Provider");
        if (fileStorageProvider == "Azure")
            builder.Services.AddScoped<IFileUtileService, AzureFileUtileService>();
        else
            builder.Services.AddScoped<IFileUtileService, LocalFileUtileService>();

        // Account module repositories / services.
        builder.Services.AddScoped<ITransactionRepository, TransactionRepository>();
        builder.Services.AddScoped<IPurchaseOrderRepository, PurchaseOrderRepository>();
        builder.Services.AddScoped<IPoNumberService, Novologs.Infrastructure.Services.PoNumberService>();
        builder.Services.AddScoped<IPurchaseInvoiceRepository, PurchaseInvoiceRepository>();
        builder.Services.AddScoped<ISalesInvoiceRepository, SalesInvoiceRepository>();
        builder.Services.AddScoped<IDebitNoteRepository, DebitNoteRepository>();
        builder.Services.AddScoped<ICreditNoteRepository, CreditNoteRepository>();

        // Chat / AI services.
        builder.Services.AddScoped<IChatService, ChatService>();
        builder.Services.AddScoped<IChatVoiceProcessingService, ChatVoiceProcessingService>();
        builder.Services.AddSingleton<IChatMessageCacheService, ChatMessageCacheService>();
        builder.Services.AddScoped<IAiBotUserService, AiBotUserService>();
        builder.Services.AddSingleton<IAiChatService, AiChatService>();

        // Task background translation.
        builder.Services.AddScoped<ITranslationBackgroundService, TranslationBackgroundService>();

        // Application-layer services consumed by MediatR handlers / authorizers.
        builder.Services.AddScoped<IVoiceProcessingService, VoiceProcessingService>();
        builder.Services.AddScoped<IFolderPolicyService, FolderPolicyService>();

        // Email / notification + message templates.
        builder.Services.AddScoped<SendEmailAndNotificationService>();
        builder.Services.AddMessageTemplates();

        // Hangfire (PostgreSQL storage).
        var hangfireConnection = builder.Configuration.GetConnectionString("HangfireDb")
            ?? builder.Configuration.GetConnectionString("DefaultConnection");

        builder.Services.AddHangfire(cfg => cfg
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_170)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UseSqlServerStorage(hangfireConnection, new SqlServerStorageOptions
            {
                SchemaName = "hangfire",
                QueuePollInterval = TimeSpan.FromSeconds(15),
                PrepareSchemaIfNecessary = true
            }));

        builder.Services.AddHangfireServer();
    }
}
