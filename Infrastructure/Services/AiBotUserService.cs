using Novologs.Application.Modules.Chat.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Memory;
using Novologs.Application.Common.Interfaces;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;

namespace Novologs.Infrastructure.Services;

public class AiBotUserService : IAiBotUserService
{
    private const string BotUserName = "ai.assistant@system";
    private const string BotEmail = "ai.assistant@system.local";
    private const string BotFullName = "AI Assistant";

    private readonly ITenantDbContext _context;
    private readonly UserManager<TenantUser> _userManager;
    private readonly IMemoryCache _cache;

    public AiBotUserService(
        ITenantDbContext context,
        UserManager<TenantUser> userManager,
        IMemoryCache cache)
    {
        _context = context;
        _userManager = userManager;
        _cache = cache;
    }

    public async Task<Guid> EnsureAiBotUserAsync(string tenantId, CancellationToken ct = default)
    {
        var cacheKey = $"aibot_{tenantId}";
        if (_cache.TryGetValue(cacheKey, out Guid cachedId) && cachedId != Guid.Empty)
            return cachedId;

        var existing = _context.GetSet<TenantUser>()
            .FirstOrDefault(u => u.UserName == BotUserName);

        if (existing != null)
        {
            _cache.Set(cacheKey, existing.Id, TimeSpan.FromHours(24));
            return existing.Id;
        }

        var botUser = new TenantUser
        {
            Id = Guid.NewGuid(),
            UserName = BotUserName,
            NormalizedUserName = BotUserName.ToUpperInvariant(),
            Email = BotEmail,
            NormalizedEmail = BotEmail.ToUpperInvariant(),
            FullName = BotFullName,
            IsActive = true,
            UserType = UserType.Internal,
            EmailConfirmed = true,
            SecurityStamp = Guid.NewGuid().ToString()
        };

        var result = await _userManager.CreateAsync(botUser, Guid.NewGuid().ToString("N") + "Aa1!");
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to create AI bot user: {errors}");
        }

        _cache.Set(cacheKey, botUser.Id, TimeSpan.FromHours(24));
        return botUser.Id;
    }
}
