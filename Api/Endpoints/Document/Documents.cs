using Novologs.Application.Modules.Document.Documents.Queries.GetPublicDocument;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

using Novologs.Application.Modules.Document.Documents.Commands.AddDocument;
using Novologs.Application.Modules.Document.Documents.Commands.DeleteDocument;
using Novologs.Application.Modules.Document.Documents.Commands.UpdateDocument;
using Novologs.Application.Modules.Document.Documents.Queries.GetDocument;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

public class Documents : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/Document").RequireAuthorization().WithOpenApi();
        manageGroup.MapPost("/getDocument", GetDocument);
        manageGroup.MapPost("/addDocument", AddDocument);
        manageGroup.MapPut("/updateDocument", UpdateDocument);
        manageGroup.MapDelete("/deleteDocument/{id:guid}", DeleteDocument);

        manageGroup = app.MapGroup("/Public").WithOpenApi();
        manageGroup.MapPost("/getPublicDocument", GetPublicDocument).AllowAnonymous();
    }

    public async Task<Result<GetPublicDocumentResponse>> GetPublicDocument(ISender sender,
        [FromBody] GetPublicDocumentQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<Result<GetDocumentResponse>> GetDocument(ISender sender, [FromBody] GetDocumentQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<Result<AddDocumentResponse>> AddDocument(ISender sender, [FromBody] AddDocumentCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<UpdateDocumentResponse>> UpdateDocument(ISender sender,
        [FromBody] UpdateDocumentCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<DeleteDocumentResponse>> DeleteDocument(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteDocumentCommand { Id = id });
    }
}
