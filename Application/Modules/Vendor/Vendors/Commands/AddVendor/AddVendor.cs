using Novologs.Application.Common.Interfaces;
using Novologs.Application.Common.Models;
using Novologs.Application.Tenant;
using Novologs.Domain.Enums;

namespace Novologs.Application.Modules.Vendor.Vendors.Commands.AddVendor;

public record AddVendorCommand : IRequest<Result<AddVendorResponse>>
{
    public string Name { get; set; } = null!;
    public string? Code { get; set; }
    public string? Website { get; set; } = null!;
    public string? Address { get; set; } = null!;
    public string? Email { get; set; } = null!;
    public string? Phonenumber { get; set; } = null!;
    public string? Emirate { get; set; } = null!;
    public double? LocationLatitude { get; set; }
    public double? LocationLongitude { get; set; }
    public Guid? LogoFileId { get; set; }
    public bool IsAccount { get; set; } = false;


    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<AddVendorCommand, Novologs.Domain.Entities.Vendor>();
        }
    }
}

public class AddVendorResponse
{
    public Guid Id { get; set; }
}

public class AddVendorCommandValidator : AbstractValidator<AddVendorCommand>
{
    public AddVendorCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(2048).WithMessage("Name must not exceed 2048 characters.");

        RuleFor(v => v.Code)
            .MaximumLength(200).WithMessage("VendorCode must not exceed 200 characters.");
        RuleFor(v => v.Code)
            .MustAsync(async (vendorCode, cancellationToken) =>
            {
                if (string.IsNullOrWhiteSpace(vendorCode)) return true;
                return !await context.GetSet<Novologs.Domain.Entities.Vendor>()
                    .AnyAsync(c => c.Code != null && c.Code.ToLower() == vendorCode.ToLower(), cancellationToken);
            }).WithMessage("Vendor code already used.");

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

public class AddVendorCommandHandler : IRequestHandler<AddVendorCommand, Result<AddVendorResponse>>
{
    // GUID of the "Trade Creditors" account (code 21110, level 4) in the chart of accounts.
    // Vendors are accounts payable, so their GL accounts live under Trade Creditors.
    private static readonly Guid TradeCreditorAccountId = new("b0b9a334-d481-4663-813c-5255945e5d13");

    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;
    private readonly IUser _user;

    public AddVendorCommandHandler(ITenantDbContext context, IMapper mapper, IUser user)
    {
        _context = context;
        _mapper = mapper;
        _user = user;
    }

    public async Task<Result<AddVendorResponse>> Handle(AddVendorCommand request, CancellationToken cancellationToken)
    {
        var vendor = _mapper.Map<Novologs.Domain.Entities.Vendor>(request);
        vendor.CreatorId = Guid.Parse(_user.Id!);

        _context.GetSet<Novologs.Domain.Entities.Vendor>().Add(vendor);
        await _context.SaveChangesAsync(cancellationToken);

        // Create a GL account for this vendor under "Trade Creditors" (21110).
        // Vendors are accounts payable — their GL accounts are a liability, not an asset.
        var tradeCreditor = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .FirstOrDefaultAsync(a => a.Id == TradeCreditorAccountId && !a.IsDeleted, cancellationToken);

        if (tradeCreditor != null)
        {
            var accountCode = await GenerateNextCodeAsync(tradeCreditor, cancellationToken);

            var vendorAccount = new Novologs.Domain.Entities.Account(Guid.NewGuid())
            {
                Code = accountCode,
                Name = vendor.Name,
                AccountType = AccountType.Liability,
                AccountCategory = AccountCategory.ShortTermLiability,
                Level = tradeCreditor.Level + 1,
                ParentAccountId = TradeCreditorAccountId,
                IsActive = true,
                IsSubcategory = false
            };

            await _context.GetSet<Novologs.Domain.Entities.Account>().AddAsync(vendorAccount, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);

            var vendorAccountLink = new Novologs.Domain.Entities.VendorAccount(Guid.NewGuid())
            {
                VendorId = vendor.Id,
                AccountId = vendorAccount.Id
            };
            await _context.GetSet<Novologs.Domain.Entities.VendorAccount>().AddAsync(vendorAccountLink, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        var generalVendorsFolder = await _context.GetSet<Novologs.Domain.Entities.Folder>()
            .FirstOrDefaultAsync(f => f.Type == FolderType.General && f.Name == Constants.FolderNames.Vendors,
                cancellationToken);

        if (generalVendorsFolder != null)
        {
            var vendorFolder = new Novologs.Domain.Entities.Folder(Guid.NewGuid())
            {
                Name = vendor.Name,
                Type = FolderType.Shared,
                ParentFolderId = generalVendorsFolder.Id,
                IsFile = false,
                CreatorId = vendor.CreatorId,
                VendorId = vendor.Id
            };
            await _context.GetSet<Novologs.Domain.Entities.Folder>().AddAsync(vendorFolder, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        return Result<AddVendorResponse>.Success(new AddVendorResponse { Id = vendor.Id });
    }

    /// <summary>
    /// Generates the next available Level-5 child code under the given parent (Trade Creditors, level 4).
    /// Level 5 increment is +1, so codes will be 21111, 21112, 21115, … skipping existing ones.
    /// </summary>
    private async Task<string> GenerateNextCodeAsync(Novologs.Domain.Entities.Account parent, CancellationToken cancellationToken)
    {
        const int level5Increment = 1;

        var siblingCodes = await _context.GetSet<Novologs.Domain.Entities.Account>()
            .IgnoreQueryFilters()
            .Where(a => a.ParentAccountId == parent.Id)
            .Select(a => a.Code)
            .ToListAsync(cancellationToken);

        if (!int.TryParse(parent.Code, out int parentCodeInt))
            throw new InvalidOperationException($"Trade Creditors code '{parent.Code}' is not a valid numeric code.");

        int maxCode = 0;
        foreach (var sibCode in siblingCodes)
        {
            if (int.TryParse(sibCode, out int sibCodeInt) && sibCodeInt > maxCode)
                maxCode = sibCodeInt;
        }

        int nextCode = maxCode == 0 ? parentCodeInt + level5Increment : maxCode + level5Increment;

        string candidate = nextCode.ToString();
        while (await _context.GetSet<Novologs.Domain.Entities.Account>()
                   .IgnoreQueryFilters()
                   .AnyAsync(a => a.Code == candidate, cancellationToken))
        {
            nextCode += level5Increment;
            candidate = nextCode.ToString();
        }

        return candidate;
    }
}
