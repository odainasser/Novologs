namespace Novologs.Api.Infrastructure;

/// <summary>
/// Base class for a module's minimal-API endpoint group. Each module declares
/// one (or more) subclasses; <c>MapEndpoints</c> discovers and maps them at startup.
/// </summary>
public abstract class EndpointGroupBase
{
    public abstract void Map(WebApplication app);
}
