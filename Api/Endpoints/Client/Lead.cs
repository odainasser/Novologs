using Novologs.Application.Modules.Client.Leads.Commands.AddLead;
using Novologs.Application.Modules.Client.Leads.Commands.ChangeLeadStatus;
using Novologs.Application.Modules.Client.Leads.Commands.DeleteLead;
using Novologs.Application.Modules.Client.Leads.Commands.RemoveLeadMember;
using Novologs.Application.Modules.Client.Leads.Commands.ShareLeadWithMembers;
using Novologs.Application.Modules.Client.Leads.Commands.TransferLeadOwnership;
using Novologs.Application.Modules.Client.Leads.Commands.UpdateLead;
using Novologs.Application.Modules.Client.Leads.Commands.UpdateLeadMemberPermission;
using Novologs.Application.Modules.Client.Leads.Dto;
using Novologs.Application.Modules.Client.Leads.Queries.GetLead;
using Novologs.Application.Modules.Client.Leads.Queries.GetLeadMembers;
using Novologs.Application.Modules.Client.Leads.Queries.GetSharedLeads;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using SystemLoaders.Filtration;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class LeadEndpoints : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/leads").RequireAuthorization().WithOpenApi();
        
        // Existing endpoints
        group.MapPost("/getLeads", GetLeads);
        group.MapPost("/addLead", AddLead);
        group.MapPut("/updateLead", UpdateLead);
        group.MapDelete("/deleteLead/{id}", DeleteLead);
        group.MapPut("/changeLeadStatus", ChangeLeadStatus);
        
        // Shared leads endpoints
        group.MapPost("/shareLeadWithMembers", ShareLeadWithMembers);
        group.MapPut("/updateLeadMemberPermission", UpdateLeadMemberPermission);
        group.MapDelete("/removeLeadMember", RemoveLeadMember);
        group.MapGet("/getLeadMembers/{leadId}", GetLeadMembers);
        group.MapPost("/getSharedLeads", GetSharedLeads);
        group.MapPut("/transferLeadOwnership", TransferLeadOwnership);
    }

    private async Task<Result<ChangeLeadStatusResponse>> ChangeLeadStatus(ISender sender,
        [FromBody] ChangeLeadStatusCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<GetLeadResponse>> GetLeads(ISender sender, [FromBody] GetLeadQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<AddLeadResponse>> AddLead(ISender sender, [FromBody] AddLeadCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<UpdateLeadResponse>> UpdateLead(ISender sender, [FromBody] UpdateLeadCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<DeleteLeadResponse>> DeleteLead(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteLeadCommand { Id = id });
    }

    private async Task<Result<bool>> ShareLeadWithMembers(ISender sender, [FromBody] ShareLeadWithMembersCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<bool>> UpdateLeadMemberPermission(ISender sender, [FromBody] UpdateLeadMemberPermissionCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<bool>> RemoveLeadMember(ISender sender, [FromBody] RemoveLeadMemberCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<List<LeadMemberDto>>> GetLeadMembers(ISender sender, Guid leadId)
    {
        return await sender.Send(new GetLeadMembersQuery { LeadId = leadId });
    }

    private async Task<Result<GetSharedLeadsResponse>> GetSharedLeads(ISender sender, [FromBody] GetSharedLeadsQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<bool>> TransferLeadOwnership(ISender sender, [FromBody] TransferLeadOwnershipCommand command)
    {
        return await sender.Send(command);
    }
}
