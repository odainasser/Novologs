using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Application.AuditLogs.Queries.GetAuditLogs;

namespace Novologs.Api.Endpoints.Tenant;

public class AuditLogs : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/manage").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getAuditLogs", GetAuditLogs);
    }

    private async Task<Result<GetAuditLogsResponse>> GetAuditLogs([FromServices] ISender sender,
        [FromBody] GetAuditLogsQuery query)
    {
        return await sender.Send(query);
    }
}
