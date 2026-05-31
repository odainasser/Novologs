using Novologs.Application.Modules.Client.SalesTargets.Commands.AddSalesTarget;
using Novologs.Application.Modules.Client.SalesTargets.Commands.AddSalesTargetList;
using Novologs.Application.Modules.Client.SalesTargets.Commands.DeleteSalesTarget;
using Novologs.Application.Modules.Client.SalesTargets.Commands.UpdateSalesTarget;
using Novologs.Application.Modules.Client.SalesTargets.Queries.GetSalesTarget;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

namespace Novologs.Api.Endpoints.Client;

public class SalesTargetEndpoints : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/salesTargets").RequireAuthorization().WithOpenApi();
        group.MapPost("/getSalesTargets", GetSalesTargets);
        group.MapPost("/addSalesTarget", AddSalesTarget);
        group.MapPut("/updateSalesTarget", UpdateSalesTarget);
        group.MapDelete("/deleteSalesTarget/{id}", DeleteSalesTarget);
        group.MapPost("/addSalesTargetList", AddSalesTargetList);
    }

    private async Task<Result<AddUpdateSalesTargetListResponse>> AddSalesTargetList(ISender sender,
        [FromBody] AddUpdateSalesTargetListCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<GetSalesTargetResponse>> GetSalesTargets(ISender sender,
        [FromBody] GetSalesTargetQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<AddSalesTargetResponse>> AddSalesTarget(ISender sender,
        [FromBody] AddSalesTargetCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<UpdateSalesTargetResponse>> UpdateSalesTarget(ISender sender,
        [FromBody] UpdateSalesTargetCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<DeleteSalesTargetResponse>> DeleteSalesTarget(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteSalesTargetCommand { Id = id });
    }
}
