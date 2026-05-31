using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Tenant;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Client.Clients.Commands.AddClient;

public record AddClientCommand : IRequest<Result<AddClientResponse>>
{
    public string? Code { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Website { get; set; }
    public string? Address { get; set; }
    public string? Email { get; set; }
    public string? Phonenumber { get; set; }
    public string? Emirate { get; set; }
    public double? LocationLatitude { get; set; }
    public double? LocationLongitude { get; set; }
    public Guid? LogoFileId { get; set; }
    public bool IsAccount { get; set; } = false;


    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddClientCommand, Novologs.Domain.Entities.Client>();
        }
    }
}

public class AddClientResponse
{
    public Guid Id { get; set; }
}

public class AddClientCommandValidator : AbstractValidator<AddClientCommand>
{
    public AddClientCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(2048).WithMessage("Name must not exceed 2048 characters."); 
        RuleFor(v => v.Code)
            .MaximumLength(200).WithMessage("Code must not exceed 200 characters.")
            .MustAsync(async (code, cancellationToken) =>
            {
                if (string.IsNullOrEmpty(code)) return true;
                return !await context.GetSet<Novologs.Domain.Entities.Client>()
                    .AnyAsync(d => d.Code == code, cancellationToken);
            }).WithMessage("Code must be unique.");


        RuleFor(v => v.Website)
            .MaximumLength(2048).WithMessage("Website must not exceed 2048 characters.");
        RuleFor(v => v.Address)
            .MaximumLength(2048).WithMessage("Address must not exceed 2048 characters.");

        RuleFor(v => v.Email)
            .MaximumLength(1024).WithMessage("Email must not exceed 1024 characters.")
            .EmailAddress().WithMessage("Email is not valid.");

        RuleFor(v => v.Phonenumber)
            .MaximumLength(512).WithMessage("Phonenumber must not exceed 512 characters.");

        RuleFor(v => v.LocationLatitude)
            .InclusiveBetween(-90, 90).WithMessage("LocationLatitude must be between -90 and 90.");
        RuleFor(v => v.LocationLongitude)
            .InclusiveBetween(-180, 180).WithMessage("LocationLongitude must be between -180 and 180.");

        RuleFor(v => v.LogoFileId)
            .MustAsync(async (logoFileId, cancellationToken) =>
            {
                if (logoFileId == null) return true;
                var folder = await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .FirstOrDefaultAsync(f => f.Id == logoFileId, cancellationToken);
                return folder != null && folder.IsFile && folder.MimeType != null &&
                       folder.MimeType.StartsWith("image/");
            }).WithMessage("Logo file must be an image file.");
    }
}

public class AddClientCommandHandler : IRequestHandler<AddClientCommand, Result<AddClientResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AddClientCommandHandler(
        ITenantDbContext context,
        IMapper mapper,
        IHttpContextAccessor httpContextAccessor)
    {
        _context = context;
        _mapper = mapper;
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<Result<AddClientResponse>> Handle(AddClientCommand request, CancellationToken cancellationToken)
    {
        var client = _mapper.Map<Novologs.Domain.Entities.Client>(request);
        var userId = _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId != null)
        {
            client.CreatorId = Guid.Parse(userId);
        }

        //get genaral Folder Clients then create folder type share under General Clients folder and save to folder Id
        var generalClientsFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
            .FirstOrDefaultAsync(f => f.Type == FolderType.General && f.Name == Constants.FolderNames.Clients
                , cancellationToken);

        if (generalClientsFolder != null)
        {
            var clientFolder = new Novologs.Domain.Entities.Folder(Guid.NewGuid())
            {
                Name = client.Name,
                Type = FolderType.Shared,
                ParentFolderId = generalClientsFolder.Id,
                IsFile = false,
                CreatorId = client.CreatorId,
                ClientId = client.Id
            };
            await _context.GetSet<Novologs.Domain.Entities.Folder>().AddAsync(clientFolder, cancellationToken);
        }

        await _context.GetSet<Novologs.Domain.Entities.Client>().AddAsync(client, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<AddClientResponse>.Success(new AddClientResponse() { Id = client.Id });
    }
}
