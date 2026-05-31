using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Application.Settings.Commands.AddSetting;
using Novologs.Application.Settings.Commands.DeleteSetting;
using Novologs.Application.Settings.Commands.UpdateSetting;
using Novologs.Application.Settings.Queries.GetSetting;

namespace Novologs.Api.Endpoints.Tenant;

public class SettingEndpoints : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/settings").RequireAuthorization().WithOpenApi();
        group.MapPost("/getSettings", GetSettings);
        group.MapPost("/addSetting", AddSetting);
        group.MapPut("/updateSetting", UpdateSetting);
        group.MapDelete("/deleteSetting/{id}", DeleteSetting);
    }

    private async Task<Result<GetSettingResponse>> GetSettings(ISender sender, [FromBody] GetSettingQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<AddSettingResponse>> AddSetting(ISender sender, [FromBody] AddSettingCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<UpdateSettingResponse>> UpdateSetting(ISender sender,
        [FromBody] UpdateSettingCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<DeleteSettingResponse>> DeleteSetting(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteSettingCommand { Id = id });
    }
}
