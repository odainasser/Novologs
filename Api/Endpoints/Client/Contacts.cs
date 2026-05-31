namespace Novologs.Api.Endpoints.Client;

using Novologs.Application.Modules.Client.Contacts.Commands.AddContact;
using Novologs.Application.Modules.Client.Contacts.Commands.DeleteContact;
using Novologs.Application.Modules.Client.Contacts.Commands.UpdateContact;
using Novologs.Application.Modules.Client.Contacts.Queries.GetContact;
using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

public class Contacts : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/contact").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getContacts", GetContacts);
        manageGroup.MapPost("/addContact", AddContact);
        manageGroup.MapPut("/updateContact", UpdateContact);
        manageGroup.MapDelete("/deleteContact/{id}", DeleteContact);
    }

    private async Task<Result<AddContactResponse>> AddContact([FromBody] AddContactCommand command,
        [FromServices] ISender sender)
    {
        return await sender.Send(command);
    }

    private async Task<Result<GetContactResponse>> GetContacts([FromBody] GetContactQuery query,
        [FromServices] ISender sender)
    {
        return await sender.Send(query);
    }

    private async Task<Result<DeleteContactResponse>> DeleteContact(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteContactCommand { Id = id });
    }

    private async Task<Result<UpdateContactResponse>> UpdateContact([FromBody] UpdateContactCommand command,
        [FromServices] ISender sender)
    {
        return await sender.Send(command);
    }
}

