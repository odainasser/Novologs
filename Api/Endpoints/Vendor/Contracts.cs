using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Modules.Vendor.Contracts.Commands.AddContract;
using Novologs.Application.Modules.Vendor.Contracts.Commands.DeleteContract;
using Novologs.Application.Modules.Vendor.Contracts.Commands.UpdateContract;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;
using Novologs.Application.Modules.Vendor.Contracts.Queries.GetContract;

namespace Novologs.Api.Endpoints.Vendor;

public class Contracts : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/Contract").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getContract", GetContract);
        manageGroup.MapPost("/addContract", AddContract);
        manageGroup.MapPut("/updateContract", UpdateContract);
        manageGroup.MapDelete("/deleteContract/{id:guid}", DeleteContract);
    }

    public async Task<Result<GetContractResponse>> GetContract(ISender sender, [FromBody] GetContractQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<Result<AddContractResponse>> AddContract(ISender sender, [FromBody] AddContractCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<UpdateContractResponse>> UpdateContract(ISender sender,
        [FromBody] UpdateContractCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<DeleteContractResponse>> DeleteContract(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteContractCommand { Id = id });
    }
}
