using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;
using Novologs.Application.Modules.Vendor.ContractTypes.Commands.AddContractType;
using Novologs.Application.Modules.Vendor.ContractTypes.Commands.DeleteContractType;
using Novologs.Application.Modules.Vendor.ContractTypes.Commands.UpdateContractType;
using Novologs.Application.Modules.Vendor.ContractTypes.Queries.GetContractType;

namespace Novologs.Api.Endpoints.Vendor;

public class ContractTypes : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/ContractType").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getContractType", GetContractType);
        manageGroup.MapPost("/addContractType", AddContractType);
        manageGroup.MapPut("/updateContractType", UpdateContractType);
        manageGroup.MapDelete("/deleteContractType/{id:guid}", DeleteContractType);
    }

    public async Task<Result<GetContractTypeResponse>> GetContractType(ISender sender, [FromBody] GetContractTypeQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<Result<AddContractTypeResponse>> AddContractType(ISender sender, [FromBody] AddContractTypeCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<UpdateContractTypeResponse>> UpdateContractType(ISender sender, [FromBody] UpdateContractTypeCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<DeleteContractTypeResponse>> DeleteContractType(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteContractTypeCommand { Id = id });
    }
}
