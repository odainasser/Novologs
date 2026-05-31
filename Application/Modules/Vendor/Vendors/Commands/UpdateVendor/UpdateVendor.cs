using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.Modules.Vendor.Vendors.Commands.UpdateVendor;

public record UpdateVendorCommand : IRequest<Result<UpdateVendorResponse>>
{
    public Guid Id { get; set; }
    public string? Name { get; set; } = null!;
    public string? Code { get; set; }
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
            CreateMap<UpdateVendorCommand, Novologs.Domain.Entities.Vendor>();
        }
    }
}

public class UpdateVendorResponse
{
}

public class UpdateVendorCommandValidator : AbstractValidator<UpdateVendorCommand>
{
    public UpdateVendorCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.Vendor>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Vendor not found.");
        RuleFor(v => v.Code)
            .MaximumLength(200).WithMessage("VendorCode must not exceed 200 characters.");
        RuleFor(v => new { VendorCode = v.Code, v.Id })
            .MustAsync(async (pair, cancellationToken) =>
            {
                if (string.IsNullOrWhiteSpace(pair.VendorCode)) return true;
                return !await context.GetSet<Novologs.Domain.Entities.Vendor>()
                    .AnyAsync(c => c.Code != null && c.Code.ToLower() == pair.VendorCode.ToLower() && c.Id != pair.Id,
                        cancellationToken);
            }).WithMessage("Vendor code already used.");

        RuleFor(v => v.Name)
            .MaximumLength(2048).WithMessage("Name must not exceed 2048 characters.");

        RuleFor(v => v.Website)
            .MaximumLength(2048).WithMessage("Website must not exceed 2048 characters.");

        RuleFor(v => v.Address)
            .MaximumLength(2048).WithMessage("Address must not exceed 2048 characters.");

        RuleFor(v => v.Email)
            .MaximumLength(1024).WithMessage("Email must not exceed 1024 characters.")
            .EmailAddress().WithMessage("Email must be a valid email address.");

        RuleFor(v => v.Phonenumber)
            .MaximumLength(512).WithMessage("Phonenumber must not exceed 512 characters.");

        RuleFor(v => v.Emirate)
            .MaximumLength(512).WithMessage("Emirate must not exceed 512 characters.");

        RuleFor(v => v.LogoFileId)
            .MustAsync(async (logoFileId, cancellationToken) =>
            {
                if (logoFileId == null) return true;
                return await context.GetSet<Novologs.Domain.Entities.Folder>()
                    .AnyAsync(f => f.Id == logoFileId && f.IsFile, cancellationToken);
            }).WithMessage("LogoFileId is invalid or not a file.");
    }
}

public class UpdateVendorCommandHandler : IRequestHandler<UpdateVendorCommand, Result<UpdateVendorResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateVendorCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateVendorResponse>> Handle(UpdateVendorCommand request,
        CancellationToken cancellationToken)
    {
        var vendor = _context.GetSet<Novologs.Domain.Entities.Vendor>()
            .FirstOrDefault(c => c.Id == request.Id);
        if (vendor == null)
        {
            return Result<UpdateVendorResponse>.Failure("Vendor_003", "Vendor not found");
        }

        _mapper.Map(request, vendor);
        _context.GetSet<Novologs.Domain.Entities.Vendor>().Update(vendor);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<UpdateVendorResponse>.Success(new UpdateVendorResponse());
    }
}
