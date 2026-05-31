using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;

namespace Novologs.Application.CompanyBranches.Commands.AddCompanyBranch;

public record AddCompanyBranchCommand : IRequest<Result<AddCompanyBranchResponse>>
{
    public string Name { get; set; } = null!;
    public string? Code { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public string? Country { get; set; }
    public string? City { get; set; }
    public string? Address { get; set; }

    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddCompanyBranchCommand, Domain.Entities.CompanyBranch>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => Guid.NewGuid()));
        }
    }
}

public class AddCompanyBranchResponse
{
    public Guid Id { get; set; }
}

public class AddCompanyBranchCommandValidator : AbstractValidator<AddCompanyBranchCommand>
{
    public AddCompanyBranchCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(2048).WithMessage("Name must not exceed 2048 characters.")
            .MustAsync(async (name, cancellationToken) =>
            {
                return !await context.GetSet<Domain.Entities.CompanyBranch>()
                    .AnyAsync(cb => cb.Name.Trim().ToLower() == name.Trim().ToLower(), cancellationToken);
            }).WithMessage("Name already exists.");

        RuleFor(v => v.Code)
            .MaximumLength(200).WithMessage("Code must not exceed 200 characters.")
            .MustAsync(async (code, cancellationToken) =>
            {
                if (string.IsNullOrEmpty(code)) return true;
                return !await context.GetSet<Domain.Entities.CompanyBranch>()
                    .AnyAsync(cb => cb.Code!.Trim().ToLower() == code.Trim().ToLower(), cancellationToken);
            }).WithMessage("Code already exists.");

        RuleFor(v => v.Phone)
            .MaximumLength(20).WithMessage("Phone must not exceed 20 characters.");

        RuleFor(v => v.Email)
            .MaximumLength(256).WithMessage("Email must not exceed 256 characters.")
            .EmailAddress().When(v => !string.IsNullOrEmpty(v.Email)).WithMessage("Invalid email format.");

        RuleFor(v => v.Country)
            .MaximumLength(100).WithMessage("Country must not exceed 100 characters.");

        RuleFor(v => v.City)
            .MaximumLength(100).WithMessage("City must not exceed 100 characters.");

        RuleFor(v => v.Address)
            .MaximumLength(2048).WithMessage("Address must not exceed 2048 characters.");
    }
}

public class AddCompanyBranchCommandHandler : IRequestHandler<AddCompanyBranchCommand, Result<AddCompanyBranchResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public AddCompanyBranchCommandHandler(ITenantDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<AddCompanyBranchResponse>> Handle(AddCompanyBranchCommand request,
        CancellationToken cancellationToken)
    {
        var companyBranch = _mapper.Map<Domain.Entities.CompanyBranch>(request);
        await _context.GetSet<Domain.Entities.CompanyBranch>().AddAsync(companyBranch, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<AddCompanyBranchResponse>.Success(new AddCompanyBranchResponse() { Id = companyBranch.Id });
    }
}
