using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Modules.Client.RejectionReasons.Commands.AddRejectionReason;
using Novologs.Application.Modules.Client.RejectionReasons.Commands.DeleteRejectionReason;
using Novologs.Application.Modules.Client.RejectionReasons.Commands.UpdateRejectionReason; 
using Novologs.Application.Modules.Client.RejectionReasons.Queries.GetRejectionReason;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

 

public class RejectionReasonEndpoints : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/rejectionReasons").RequireAuthorization().WithOpenApi();
        group.MapPost("/getRejectionReasons", GetRejectionReasons);
        group.MapPost("/addRejectionReason", AddRejectionReason);
        group.MapPut("/updateRejectionReason", UpdateRejectionReason);
        group.MapDelete("/deleteRejectionReason/{id}", DeleteRejectionReason);
    }

    private async Task<Result<GetRejectionReasonResponse>> GetRejectionReasons(ISender sender, [FromBody] GetRejectionReasonQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<AddRejectionReasonResponse>> AddRejectionReason(ISender sender, [FromBody] AddRejectionReasonCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<UpdateRejectionReasonResponse>> UpdateRejectionReason(ISender sender, [FromBody] UpdateRejectionReasonCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<DeleteRejectionReasonResponse>> DeleteRejectionReason(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteRejectionReasonCommand { Id = id });
    }
}

