using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Application.WorkStatuss.Commands.AddWorkStatus;
using Novologs.Application.WorkStatuss.Commands.ChangMyWorkStatus;
using Novologs.Application.WorkStatuss.Commands.DeleteWorkStatus;
using Novologs.Application.WorkStatuss.Commands.UpdateWorkStatus;
using Novologs.Application.WorkStatuss.Queries.GetWorkStatus;

namespace Novologs.Api.Endpoints.Tenant;

public class WorkStatusEndpoints : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/workstatuses").RequireAuthorization().WithOpenApi();
        group.MapPost("/getWorkStatuses", GetWorkStatuses);
        group.MapPost("/addWorkStatus", AddWorkStatus);
        group.MapPut("/updateWorkStatus", UpdateWorkStatus);
        group.MapDelete("/deleteWorkStatus/{id}", DeleteWorkStatus);
        group.MapPut("/changeMyWorkStatus", ChangeMyWorkStatus);
    }

    private async Task<Result<ChangMyWorkStatusResponse>> ChangeMyWorkStatus(ISender sender,
        [FromBody] ChangMyWorkStatusCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<GetWorkStatusResponse>> GetWorkStatuses(ISender sender,
        [FromBody] GetWorkStatusQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<AddWorkStatusResponse>> AddWorkStatus(ISender sender,
        [FromBody] AddWorkStatusCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<UpdateWorkStatusResponse>> UpdateWorkStatus(ISender sender,
        [FromBody] UpdateWorkStatusCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<DeleteWorkStatusResponse>> DeleteWorkStatus(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteWorkStatusCommand { Id = id });
    }
}
