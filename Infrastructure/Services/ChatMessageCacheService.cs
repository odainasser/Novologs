using System.Collections.Concurrent;
using Novologs.Application.Modules.Chat.Services;
using Microsoft.Extensions.Primitives;

namespace Novologs.Infrastructure.Services;

/// <summary>
/// Singleton service that manages per-room cancellation tokens used to expire
/// IMemoryCache entries whenever a room's messages are mutated.
/// </summary>
public class ChatMessageCacheService : IChatMessageCacheService
{
    private readonly ConcurrentDictionary<string, CancellationTokenSource> _tokens = new();

    public IChangeToken GetRoomChangeToken(string tenantId, Guid roomId)
    {
        var key = BuildKey(tenantId, roomId);
        var cts = _tokens.GetOrAdd(key, _ => new CancellationTokenSource());
        return new CancellationChangeToken(cts.Token);
    }

    public void InvalidateRoom(string tenantId, Guid roomId)
    {
        var key = BuildKey(tenantId, roomId);
        if (_tokens.TryRemove(key, out var cts))
        {
            cts.Cancel();
            cts.Dispose();
        }
    }

    private static string BuildKey(string tenantId, Guid roomId) => $"{tenantId}:{roomId}";
}
