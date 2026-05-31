using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;

namespace Novologs.Application.Modules.Vendor.Contacts.Commands.UpdateContact;

public record UpdateContactCommand : IRequest<Result<UpdateContactResponse>>
{
    public Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Email { get; set; }
    public string? MobileNumber { get; set; }
    public string? PhoneNumber { get; set; }
    public string? Designation { get; set; }
    public Guid? VendorId { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateContactCommand, Novologs.Domain.Entities.Contact>()
                .ForAllMembers(opts => opts.Condition((_, _, srcMember) => srcMember != null));
        }
    }
}

public class UpdateContactResponse
{
}

public class UpdateContactCommandValidator : AbstractValidator<UpdateContactCommand>
{
    public UpdateContactCommandValidator(ITenantDbContext context, IUser user)
    {

        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Contact ID is required.")
            .MustAsync(async (id, cancellationToken) =>
            {
                return await context.GetSet<Novologs.Domain.Entities.Contact>()
                    .AnyAsync(c => c.Id == id, cancellationToken);
            }).WithMessage("Contact not found.");

        RuleFor(v => v.Name)
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

public class UpdateContactCommandHandler : IRequestHandler<UpdateContactCommand, Result<UpdateContactResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateContactCommandHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateContactResponse>> Handle(UpdateContactCommand request,
        CancellationToken cancellationToken)
    {
        var contact = await _context.GetSet<Novologs.Domain.Entities.Contact>()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (contact == null)
        {
            return Result<UpdateContactResponse>.Failure("Contact_003", "Contact not found");
        }

        _mapper.Map(request, contact);
        _context.GetSet<Novologs.Domain.Entities.Contact>().Update(contact);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<UpdateContactResponse>.Success(new UpdateContactResponse());
    }
}
