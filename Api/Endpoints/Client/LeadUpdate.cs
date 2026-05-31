using Novologs.Application.Modules.Client.Leads.LeadUpdates.Commands.AddLeadUpdate;
using Novologs.Application.Modules.Client.Leads.LeadUpdates.Commands.DeleteLeadUpdate;
using Novologs.Application.Modules.Client.Leads.LeadUpdates.Commands.UpdateLeadUpdate;
using Novologs.Application.Modules.Client.Leads.LeadUpdates.Queries.GetLeadUpdate;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class LeadUpdateEndpoints : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/leads/updates").RequireAuthorization().WithOpenApi();

        group.MapPost("/getLeadUpdates", GetLeadUpdates);
        group.MapPost("/addLeadUpdate", AddLeadUpdate);
        group.MapPut("/updateLeadUpdate", UpdateLeadUpdate);
        group.MapDelete("/deleteLeadUpdate/{id}", DeleteLeadUpdate);
    }

    private async Task<Result<GetLeadUpdateResponse>> GetLeadUpdates(ISender sender, [FromBody] GetLeadUpdateQuery query)
        => await sender.Send(query);

    private async Task<Result<AddLeadUpdateResponse>> AddLeadUpdate(ISender sender, [FromBody] AddLeadUpdateCommand command)
        => await sender.Send(command);

    private async Task<Result<UpdateLeadUpdateResponse>> UpdateLeadUpdate(ISender sender, [FromBody] UpdateLeadUpdateCommand command)
        => await sender.Send(command);

    private async Task<Result<DeleteLeadUpdateResponse>> DeleteLeadUpdate(ISender sender, Guid id)
        => await sender.Send(new DeleteLeadUpdateCommand { Id = id });
}
