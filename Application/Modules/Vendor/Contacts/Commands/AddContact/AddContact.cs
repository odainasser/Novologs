using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Vendor.Contacts.Commands.AddContact;

public record AddContactCommand : IRequest<Result<AddContactResponse>>
{
    public string Name { get; set; } = null!;
    public string? Email { get; set; }
    public string? MobileNumber { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Designation { get; set; }
    public Guid? VendorId { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddContactCommand, Novologs.Domain.Entities.Contact>();
        }
    }
}

public class AddContactResponse
{
    public Guid Id { get; set; }
}

public class AddContactCommandValidator : AbstractValidator<AddContactCommand>
{
    public AddContactCommandValidator(ITenantDbContext context, IUser user)
    {

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(2048).WithMessage("Name must not exceed 2048 characters.");

        RuleFor(v => v.Email)
            .MaximumLength(1024).WithMessage("Email must not exceed 1024 characters.")
            .EmailAddress().When(v => !string.IsNullOrEmpty(v.Email)).WithMessage("Email is not valid.");

        RuleFor(v => v.MobileNumber)
            .MaximumLength(512).WithMessage("Mobile Number must not exceed 512 characters.");

        RuleFor(v => v.PhoneNumber)
            .MaximumLength(512).WithMessage("Phone Number must not exceed 512 characters.");

        RuleFor(v => v.Designation)
            .MaximumLength(1024).WithMessage("Designation must not exceed 1024 characters.");

        RuleFor(v => v.VendorId)
            .MustAsync(async (vendorId, cancellationToken) =>
            {
                if (!vendorId.HasValue) return true;
                return await context.GetSet<Novologs.Domain.Entities.Vendor>()
                    .AnyAsync(c => c.Id == vendorId, cancellationToken);
            }).WithMessage("Vendor not found.");
    }
}

public class AddContactCommandHandler : IRequestHandler<AddContactCommand, Result<AddContactResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public AddContactCommandHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<AddContactResponse>> Handle(AddContactCommand request, CancellationToken cancellationToken)
    {
        var contact = _mapper.Map<Novologs.Domain.Entities.Contact>(request);
        _context.GetSet<Novologs.Domain.Entities.Contact>().Add(contact);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<AddContactResponse>.Success(new AddContactResponse() { Id = contact.Id });
    }
}
