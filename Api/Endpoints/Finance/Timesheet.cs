using Novologs.Application.Modules.Finance.ItemCosts.Queries.GetItemCost;
using Novologs.Application.Modules.Finance.Timesheets.Commands.AddTimesheet;
using Novologs.Application.Modules.Finance.Timesheets.Commands.DeleteTimesheet;
using Novologs.Application.Modules.Finance.Timesheets.Commands.UpdateTimesheet;
using Novologs.Application.Modules.Finance.Timesheets.Queries.GetTimesheet;
using Novologs.Application.Modules.Finance.TimeSlots.Queries.GetAvailableTimeSlots;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class Timesheet : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/Timesheet").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/addTimesheet", AddTimesheet);
        manageGroup.MapPut("/updateTimesheet", UpdateTimesheet);
        manageGroup.MapDelete("/deleteTimesheet/{id}", DeleteTimesheet);
        manageGroup.MapPost("/getTimesheet", GetTimesheet);
        manageGroup.MapPost("/getItemCost", GetItemCost);
        manageGroup.MapPost("/getAvailableTimeSlots", GetAvailableTimeSlots);
    }

    private async Task<Result<GetAvailableTimeSlotsResponse>> GetAvailableTimeSlots([FromServices] ISender sender,
        [FromBody] GetAvailableTimeSlotsQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<GetItemCostResponse>> GetItemCost([FromServices] ISender sender,
        [FromBody] GetItemCostQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<GetTimesheetResponse>> GetTimesheet([FromServices] ISender sender,
        [FromBody] GetTimesheetQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<DeleteTimesheetResponse>> DeleteTimesheet([FromServices] ISender sender, Guid id)
    {
        var command = new DeleteTimesheetCommand() { Id = id };
        return await sender.Send(command);
    }

    private async Task<Result<UpdateTimesheetResponse>> UpdateTimesheet([FromServices] ISender sender,
        [FromBody] UpdateTimesheetCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<AddTimesheetResponse>> AddTimesheet([FromServices] ISender sender,
        [FromBody] AddTimesheetCommand command)
    {
        return await sender.Send(command);
    }
}
