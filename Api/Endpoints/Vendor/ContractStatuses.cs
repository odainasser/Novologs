using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;
using Novologs.Application.Modules.Vendor.ContractStatuses.Commands.AddContractStatus;
using Novologs.Application.Modules.Vendor.ContractStatuses.Commands.DeleteContractStatus;
using Novologs.Application.Modules.Vendor.ContractStatuses.Commands.UpdateContractStatus;
using Novologs.Application.Modules.Vendor.ContractStatuses.Queries.GetContractStatus;

namespace Novologs.Api.Endpoints.Vendor;

public class ContractStatuses : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/ContractStatus").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getContractStatus", GetContractStatus);
        manageGroup.MapPost("/addContractStatus", AddContractStatus);
        manageGroup.MapPut("/updateContractStatus", UpdateContractStatus);
        manageGroup.MapDelete("/deleteContractStatus/{id:guid}", DeleteContractStatus);
    }

    public async Task<Result<GetContractStatusResponse>> GetContractStatus(ISender sender,
        [FromBody] GetContractStatusQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<Result<AddContractStatusResponse>> AddContractStatus(ISender sender,
        [FromBody] AddContractStatusCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<UpdateContractStatusResponse>> UpdateContractStatus(ISender sender,
        [FromBody] UpdateContractStatusCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<DeleteContractStatusResponse>> DeleteContractStatus(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteContractStatusCommand { Id = id });
    }
}
