using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Modules.Client.Sources.Commands.AddSource;
using Novologs.Application.Modules.Client.Sources.Commands.DeleteSource;
using Novologs.Application.Modules.Client.Sources.Commands.UpdateSource;
using Novologs.Application.Modules.Client.Sources.Queries.GetSource;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class SourceEndpoints : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var group = app.MapGroup("/sources").RequireAuthorization().WithOpenApi();
        group.MapPost("/getSources", GetSources);
        group.MapPost("/addSource", AddSource);
        group.MapPut("/updateSource", UpdateSource);
        group.MapDelete("/deleteSource/{id}", DeleteSource);
    }

    private async Task<Result<GetSourceResponse>> GetSources(ISender sender, [FromBody] GetSourceQuery query)
    {
        return await sender.Send(query);
    }

    private async Task<Result<AddSourceResponse>> AddSource(ISender sender, [FromBody] AddSourceCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<UpdateSourceResponse>> UpdateSource(ISender sender,
        [FromBody] UpdateSourceCommand command)
    {
        return await sender.Send(command);
    }

    private async Task<Result<DeleteSourceResponse>> DeleteSource(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteSourceCommand { Id = id });
    }
}
