using System.Net.Mime;
using Novologs.Application.Modules.Folder.Folders.Commands.AddFolder;
using Novologs.Application.Modules.Folder.Folders.Commands.CopyFolder;
using Novologs.Application.Modules.Folder.Folders.Commands.DeleteFolder;
using Novologs.Application.Modules.Folder.Folders.Commands.ShareFolder;
using Novologs.Application.Modules.Folder.Folders.Commands.UpdateFolder;
using Novologs.Application.Modules.Folder.Folders.Queries.GetFolder;
using Novologs.Application.Modules.Folder.Folders.Queries.GetRepository;
using Novologs.Api.Utiles;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Net.Http.Headers;
using Novologs.Application.Common.Models;
using SystemLoaders.Services;
using Novologs.Api.Infrastructure;
using Novologs.Application.Tenant;
using Novologs.Domain.Entities;
using Novologs.Domain.Enums;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Modules.Folder.Folders.Queries.GetDeletedItems;
using Novologs.Application.Modules.Folder.Folders.Queries.GetDeletedFolderStructure;
using Novologs.Application.Modules.Folder.Folders.Dto;
using Microsoft.EntityFrameworkCore;

namespace Microsoft.Extensions.DependencyInjection.Endpoints;

public class Folders : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var manageGroup = app.MapGroup("/Folder").RequireAuthorization().WithOpenApi();

        manageGroup.MapPost("/addFolder", AddFolder)
            .DisableAntiforgery();
        manageGroup.MapPut("/updateFolder", UpdateFolder);
        manageGroup.MapDelete("/deleteFolder/{id:guid}", DeleteFolder);
        manageGroup.MapPost("/getFolder", GetFolder);
         manageGroup.MapPost("/shareFolder", ShareFolder);
         manageGroup.MapPost("/copyFolder", CopyFolder);
         manageGroup.MapPost("/deletedItems", GetDeletedItems);
         manageGroup.MapGet("/deletedFoldersStructure", GetDeletedFolderStructure);

        // Expose a top-level, flat repository view at `/getrepository` returning the requested JSON shape.
        manageGroup.MapGet("/getRepository", GetRepositoryFlat);

        manageGroup.MapGet("/getFile/{id:guid}", GetFile).AllowAnonymous();
        
    }

    public async Task<Result<CopyFolderResponse>> CopyFolder(ISender sender, [FromBody] CopyFolderCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<ShareFolderResponse>> ShareFolder(ISender sender, [FromBody] ShareFolderCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<IResult> GetFile(ISender sender, Guid id)
    {
        var fileResult = await sender.Send(new Novologs.Application.Modules.Folder.Folders.Queries.GetFile.GetFileQuery { Id = id });
        if (!fileResult.Succeeded)
            return Results.NotFound(fileResult.Errors);

        var file = fileResult.SuccessStatus!;
        if (!File.Exists(file.Path))
            return Results.NotFound("File not found on the server.");

        var fileInfo = new FileInfo(file.Path);
        var fileName = Path.GetFileName(file.Path);
        var contentType = InlineOrAttachmentFileResult.GetContentType(file.Path!);

        bool enableRange = false;
        bool useAsyncOpen = false;

        const long RangeThreshold = 2 * 1024 * 1024;
        if (fileInfo.Length >= RangeThreshold)
        {
            enableRange = true;
            useAsyncOpen = true;
        }

        Stream fileStream;
        if (useAsyncOpen)
        {
            fileStream = new FileStream(file.Path, FileMode.Open, FileAccess.Read, FileShare.Read,
                bufferSize: 81920,
                useAsync: true);
        }
        else
        {
            fileStream = new FileStream(file.Path, FileMode.Open, FileAccess.Read, FileShare.Read);
        }

        return new InlineOrAttachmentFileResult(fileStream, contentType, fileName, enableRange);
    }


    public async Task<Result<GetFolderResponse>> GetFolder(ISender sender, [FromBody] GetFolderQuery query)
    {
        return await sender.Send(query);
    }

    public async Task<Result<List<FolderDto>>> GetDeletedFolderStructure(ISender sender)
    {
        return await sender.Send(new GetDeletedFolderStructureQuery());
    }

    public async Task<Result<GetRepositoryResponse>> GetRepositoryOverview(ISender sender)
    {
        return await sender.Send(new GetRepositoryQuery());
    }

    public async Task<IResult> GetRepositoryFlat(ISender sender, ITenantDbContext context)
    {
        // call existing query to ensure authorization, filters etc. but we'll directly query required roots for a flat view
        // Prepare output structure
        var output = new
        {
            FilesAndFolders = new
            {
                Projects = new List<object>(),
                Clients = new List<object>(),
                Vendors = new List<object>(),
            },
            SystemGenerated = new
            {
                Tasks = new List<object>(),
                Chat = new List<object>(),
                Users = new List<object>()
            }
        };

        // Helper to fetch direct children names under a named root folder
        async Task<List<string>> ChildrenOf(string rootName)
        {
            var root = await context.GetSet<Novologs.Domain.Entities.Folder>()
                .FirstOrDefaultAsync(f => f.Name == rootName);
            if (root == null) return new List<string>();
            return await context.GetSet<Novologs.Domain.Entities.Folder>()
                .Where(f => f.ParentFolderId == root.Id)
                .Select(f => f.Name)
                .ToListAsync();
        }

        // Projects, Clients, Vendors: include files tied to entities (ProjectId/ClientId/VendorId) and folder children names
        var projectFiles = await context.GetSet<Novologs.Domain.Entities.Folder>()
            .Where(f => f.IsFile && f.ProjectId != null)
            .Select(f => new { ProjectId = f.ProjectId, FileId = f.Id, FileName = f.Name })
            .ToListAsync();
        output.FilesAndFolders.Projects.AddRange(projectFiles);
        var projectChildren = await ChildrenOf(Constants.FolderNames.Projects);
        foreach (var c in projectChildren)
            output.FilesAndFolders.Projects.Add(new { FolderName = c });

        var clientFiles = await context.GetSet<Novologs.Domain.Entities.Folder>()
            .Where(f => f.IsFile && f.ClientId != null)
            .Select(f => new { ClientId = f.ClientId, FileId = f.Id, FileName = f.Name })
            .ToListAsync();
        output.FilesAndFolders.Clients.AddRange(clientFiles);
        var clientChildren = await ChildrenOf(Constants.FolderNames.Clients);
        foreach (var c in clientChildren)
            output.FilesAndFolders.Clients.Add(new { FolderName = c });

        var vendorFiles = await context.GetSet<Novologs.Domain.Entities.Folder>()
            .Where(f => f.IsFile && f.VendorId != null)
            .Select(f => new { VendorId = f.VendorId, FileId = f.Id, FileName = f.Name })
            .ToListAsync();
        output.FilesAndFolders.Vendors.AddRange(vendorFiles);
        var vendorChildren = await ChildrenOf(Constants.FolderNames.Vendors);
        foreach (var c in vendorChildren)
            output.FilesAndFolders.Vendors.Add(new { FolderName = c });

        // System-generated roots (Tasks, Chat, Users)
        // Tasks: include files that belong to specific tasks (TaskId set) and also child names under Tasks root
        var taskFiles = await context.GetSet<Novologs.Domain.Entities.Folder>()
            .Where(f => f.IsFile && f.TaskId != null)
            .Select(f => new { TaskId = f.TaskId, FileId = f.Id, FileName = f.Name })
            .ToListAsync();

        output.SystemGenerated.Tasks.AddRange(taskFiles);
        // also add any immediate children names under the Tasks root (folders)
        var taskChildren = await ChildrenOf(Constants.FolderNames.Tasks);
        foreach (var c in taskChildren)
            output.SystemGenerated.Tasks.Add(new { FolderName = c });

        // Chat: return files under chat (files have IsFile == true and ChatRoomId != null OR parent == chat folder)
        var chatRoot = await context.GetSet<Novologs.Domain.Entities.Folder>()
            .Include(f => f.ParentFolder)
            .FirstOrDefaultAsync(f => f.Name == Constants.FolderNames.Chat && f.ParentFolder != null && f.ParentFolder.Name == Constants.System);

        if (chatRoot != null)
        {
            var chatFiles = await context.GetSet<Novologs.Domain.Entities.Folder>()
                .Where(f => f.IsFile && (f.ChatRoomId != null || f.ParentFolderId == chatRoot.Id))
                .Select(f => new { FileId = f.Id, FileName = f.Name })
                .ToListAsync();

            output.SystemGenerated.Chat.AddRange(chatFiles);
        }

        // Users: files under Users system folder (e.g., profile photos)
        var usersRoot = await context.GetSet<Novologs.Domain.Entities.Folder>()
            .Include(f => f.ParentFolder)
            .FirstOrDefaultAsync(f => f.Name == Constants.FolderNames.Users && f.ParentFolder != null && f.ParentFolder.Name == Constants.System);

        if (usersRoot != null)
        {
            var userFiles = await context.GetSet<Novologs.Domain.Entities.Folder>()
                .Where(f => f.IsFile && (f.ParentFolderId == usersRoot.Id || (f.ParentFolder != null && f.ParentFolder.ParentFolderId == usersRoot.Id)))
                .Select(f => new { FileId = f.Id, FileName = f.Name })
                .ToListAsync();

            output.SystemGenerated.Users.AddRange(userFiles);
        }

        return Results.Json(output);
    }

    public async Task<Result<AddFolderResponse>> AddFolder(ISender sender, [FromForm] AddFolderCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<UpdateFolderResponse>> UpdateFolder(ISender sender, [FromBody] UpdateFolderCommand command)
    {
        return await sender.Send(command);
    }

    public async Task<Result<DeleteFolderResponse>> DeleteFolder(ISender sender, Guid id)
    {
        return await sender.Send(new DeleteFolderCommand { Id = id });
    }

    public async Task<Result<GetDeletedItemsResponse>> GetDeletedItems(ISender sender, [FromBody] GetDeletedItemsQuery query)
    {
        return await sender.Send(query);
    }

}
