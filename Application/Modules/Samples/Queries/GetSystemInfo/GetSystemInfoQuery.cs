using MediatR;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Samples.Queries.GetSystemInfo;

// ---------------------------------------------------------------------------
// Sample vertical slice — proves the CQRS pipeline (MediatR + validation +
// Result) end to end without a database. Delete once a real module lands.
// ---------------------------------------------------------------------------

public record GetSystemInfoQuery : IRequest<Result<SystemInfoDto>>;

public record SystemInfoDto(string Product, string Architecture, DateTimeOffset ServerTimeUtc);

public class GetSystemInfoQueryHandler : IRequestHandler<GetSystemInfoQuery, Result<SystemInfoDto>>
{
    public Task<Result<SystemInfoDto>> Handle(GetSystemInfoQuery request, CancellationToken cancellationToken)
    {
        var dto = new SystemInfoDto(
            Product: "Novologs ERP",
            Architecture: "Modular Monolith — Clean Architecture + CQRS",
            ServerTimeUtc: DateTimeOffset.UtcNow);

        return Task.FromResult(Result<SystemInfoDto>.Success(dto));
    }
}
