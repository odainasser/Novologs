using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Modules.Client.SaleStatuses.Commands.AddSaleStatus;
using Novologs.Application.Modules.Client.SaleStatuses.Commands.DeleteSaleStatus;
using Novologs.Application.Modules.Client.SaleStatuses.Commands.UpdateSaleStatus;
using Novologs.Application.Modules.Client.SaleStatuses.Queries.GetSaleStatus;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;


public class SaleStatusEndpoints : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/saleStatuses").RequireAuthorization().WithOpenApi();
        group.MapPost("/getSaleStatuses", GetSaleStatuses);
        group.MapPost("/addSaleStatus", AddSaleStatus);
        group.MapPut("/updateSaleStatus", UpdateSaleStatus);
        group.MapDelete("/deleteSaleStatus/{id}", DeleteSaleStatus);
    }

    private async Task<Result<GetSaleStatusResponse>> GetSaleStatuses(ISender sender, [FromBody] GetSaleStatusQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<AddSaleStatusResponse>> AddSaleStatus(ISender sender, [FromBody] AddSaleStatusCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<UpdateSaleStatusResponse>> UpdateSaleStatus(ISender sender, [FromBody] UpdateSaleStatusCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<DeleteSaleStatusResponse>> DeleteSaleStatus(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteSaleStatusCommand { Id = id });
    }
}
