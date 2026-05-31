using MediatR;

namespace Novologs.Domain.Common;

/// <summary>Base class for domain events, dispatched via MediatR notifications.</summary>
public abstract class BaseEvent : INotification
{
}
