using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Client.Clients.Commands.UpdateClient;

public record UpdateClientCommand : IRequest<Result<UpdateClientResponse>>
{
    public Guid Id { get; set; }
    public string? Code { get; set; } = null!;
    public string? Name { get; set; } = null!;
    public string? Website { get; set; } = null!;
    public string? Address { get; set; } = null!;
    public string? Email { get; set; } = null!;
    public string? Phonenumber { get; set; } = null!;
    public string? Emirate { get; set; } = null!;
    public double? LocationLatitude { get; set; }
    public double? LocationLongitude { get; set; }
    public Guid? LogoFileId { get; set; }
    public bool? IsAccount { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            //TODO ignore null values how to unset som values (can't send null)
            CreateMap<UpdateClientCommand, Novologs.Domain.Entities.Client>()
                .ForAllMembers(opts => opts.Condition((_, _, srcMember) => srcMember != null))
                ;
        }
    }
}

public class UpdateClientResponse
{
}

public class UpdateClientCommandValidator : AbstractValidator<UpdateClientCommand>
{
    public UpdateClientCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Name)
            .MaximumLength(2048).WithMessage("Name must not exceed 2048 characters.");
        RuleFor(v => v.Code)
            .MaximumLength(200).WithMessage("Code must not exceed 200 characters.")
            .MustAsync(async (command, code, cancellationToken) =>
            {
                if (string.IsNullOrEmpty(code)) return true;
                return !await context.GetSet<Novologs.Domain.Entities.Client>()
                    .AnyAsync(d => d.Code == code && d.Id != command.Id, cancellationToken);
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
        RuleFor(v => v.Id)
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.Client>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Client not found.");
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

public class UpdateClientCommandHandler : IRequestHandler<UpdateClientCommand, Result<UpdateClientResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateClientCommandHandler(
        ITenantDbContext context,
        IMapper mapper
    )
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateClientResponse>> Handle(UpdateClientCommand request,
        CancellationToken cancellationToken)
    {
        var client = await _context.GetSet<Novologs.Domain.Entities.Client>()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);
        if (client == null)
        {
            return Result<UpdateClientResponse>.Failure("Client_002", "Client not found");
        }

        _mapper.Map(request, client);
        _context.GetSet<Novologs.Domain.Entities.Client>().Update(client);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<UpdateClientResponse>.Success(new UpdateClientResponse());
    }
}
