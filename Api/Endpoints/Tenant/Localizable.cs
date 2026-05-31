using Novologs.Application.Localizables.Commands.AddLocalizable;
using Novologs.Application.Localizables.Commands.DeleteLocalizable;
using Novologs.Application.Localizables.Commands.UpdateLocalizable;
using Novologs.Application.Localizables.Queries.GetLocalizable;

namespace Novologs.Api.Endpoints.Tenant;
//TODO add settings permission
 
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models; 

public class Localizable : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/manage").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getLocalizable", GetLocalizable);
        manageGroup.MapPost("/addLocalizable", AddLocalizable);
        manageGroup.MapPut("/updateLocalizable", UpdateLocalizable);
        manageGroup.MapDelete("/deleteLocalizable", DeleteLocalizable);
    }

    private async Task<Result<GetLocalizableResponse>> GetLocalizable([FromServices] ISender sender,
        [FromBody] GetLocalizableQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<AddLocalizableResponse>> AddLocalizable([FromServices] ISender sender,
        [FromBody] AddLocalizableCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<UpdateLocalizableResponse>> UpdateLocalizable([FromServices] ISender sender,
        [FromBody] UpdateLocalizableCommand command)
    {
        return await sender.Send(command);
    }
    private async Task<Result<DeleteLocalizableResponse>> DeleteLocalizable([FromServices] ISender sender, [FromBody] DeleteLocalizableCommand command)
    {
        return await sender.Send(command);
    }
}
