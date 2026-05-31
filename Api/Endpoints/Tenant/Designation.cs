using Novologs.Application.Designations.Commands.AddDesignation;
using Novologs.Application.Designations.Commands.DeleteDesignation;
using Novologs.Application.Designations.Commands.UpdateDesignation;
using Novologs.Application.Designations.Queries.GetDesignation;

namespace Novologs.Api.Endpoints.Tenant;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models; 

public class Designation : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/manage").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getDesignation", getDesignation);        manageGroup.MapPost("/addDesignation", addDesignation);
        manageGroup.MapPut("/updateDesignation", updateDesignation);
        manageGroup.MapDelete("/deleteDesignation", deleteDesignation);
    }

    private async Task<Result<AddDesignationResponse>> addDesignation([FromServices] ISender sender,
        [FromBody] AddDesignationCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<UpdateDesignationResponse>> updateDesignation([FromServices] ISender sender,
        [FromBody] UpdateDesignationCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<DeleteDesignationResponse>> deleteDesignation([FromServices] ISender sender,
        [FromBody] DeleteDesignationCommand command)
    {
        return await sender.Send(command);
    
    }

    private async Task<Result<GetDesignationResponse>> getDesignation([FromServices] ISender sender,
        [FromBody] GetDesignationQuery query)
    {
        return await sender.Send(query);
    }
}
