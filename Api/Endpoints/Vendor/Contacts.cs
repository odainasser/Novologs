namespace Novologs.Api.Endpoints.Vendor;

using Microsoft.AspNetCore.Mvc;
using Novologs.Application.Modules.Vendor.Contacts.Commands.AddContact;
using Novologs.Application.Modules.Vendor.Contacts.Commands.DeleteContact;
using Novologs.Application.Modules.Vendor.Contacts.Commands.UpdateContact;
using Novologs.Application.Modules.Vendor.Contacts.Queries.GetContact;
using Novologs.Application.Common.Models;
using Novologs.Api.Infrastructure;

public class Contacts : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/Contact").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/getContact", GetContact);
        manageGroup.MapPost("/addContact", AddContact);
        manageGroup.MapPut("/updateContact", UpdateContact);
        manageGroup.MapDelete("/deleteContact/{id:guid}", DeleteContact);
    }

    public async Task<Result<GetContactResponse>> GetContact(ISender sender, [FromBody] GetContactQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<Result<AddContactResponse>> AddContact(ISender sender, [FromBody] AddContactCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<UpdateContactResponse>> UpdateContact(ISender sender,
        [FromBody] UpdateContactCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<DeleteContactResponse>> DeleteContact(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteContactCommand { Id = id });
    }
}
