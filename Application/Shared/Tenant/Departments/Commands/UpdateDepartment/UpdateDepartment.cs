using Novologs.Application.Common.Models;
using Novologs.Application.Common.Interfaces;
using Novologs.Application.Localizables.DTOs;
using Novologs.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Novologs.Application.Departments.Commands.UpdateDepartment;

public record UpdateDepartmentCommand : IRequest<Result<UpdateDepartmentResponse>>
{
    public Guid Id { get; set; }
    public Guid? ParentDepartmentId { get; set; }
    public required LocalizableTextDto Name { get; set; } 
    
    private class Mapping : Profile
    {
        public Mapping()
        {
            CreateMap<UpdateDepartmentCommand, Domain.Entities.Department>()
                .ForMember(dest => dest.Name, opt => opt.Ignore());
        }
    }

}


public class UpdateDepartmentCommandValidator : AbstractValidator<UpdateDepartmentCommand>
{
    public UpdateDepartmentCommandValidator(ITenantDbContext context)
    {
        RuleFor(v => v.Id).NotEmpty().WithMessage("Id is required.");
        RuleFor(v => v.Name).NotNull().WithMessage("Name is required.");
        RuleFor(v => v.Name.Value)
            .NotEmpty().WithMessage("Name.Value is required.")
            .MaximumLength(2048).WithMessage("Name.Value must not exceed 2048 characters.")
            .MustAsync(async (command, name, cancellationToken) =>
            {
                return !await context.GetSet<Department>()
                    .AnyAsync(d => d.Name.Value.ToLower().Trim() == name.ToLower().Trim() && d.Id != command.Id, cancellationToken);
            }).WithMessage("The specified name already exists.");

    }
}

public class UpdateDepartmentResponse
{
}
public class UpdateDepartmentCommandHandler : IRequestHandler<UpdateDepartmentCommand, Result<UpdateDepartmentResponse>>
{
    private readonly ITenantDbContext _context;
    private readonly IMapper _mapper;

    public UpdateDepartmentCommandHandler(
        ITenantDbContext context,
        IMapper mapper
        )
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<UpdateDepartmentResponse>> Handle(UpdateDepartmentCommand request, CancellationToken cancellationToken)
    {
        var department = await _context.GetSet<Domain.Entities.Department>()
            .Include(d => d.Name)
            .ThenInclude(n => n.LocalizedStrings)
            .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken);
        if (department == null)
        {
            return Result<UpdateDepartmentResponse>.Failure("Department_001", "Department not found.");
        }

        var currentLocalizedStrings = department.Name.LocalizedStrings;
        var incomingLocalizedStrings = request.Name.LocalizedStrings;

        _mapper.Map(request, department);
        department.Name.Value = request.Name.Value;

        foreach (var current in currentLocalizedStrings.ToList())
        {
            if (incomingLocalizedStrings.All(inc => inc.Id != current.Id))
            {
                _context.GetSet<LocalizedString>().Remove(current);
            }
        }

        foreach (var incoming in incomingLocalizedStrings)
        {
            var existing = currentLocalizedStrings.FirstOrDefault(c => c.Id == incoming.Id);
            if (existing != null)
            {
                _mapper.Map(incoming, existing);
            }
            else
            {
                var newLocalizedString = _mapper.Map<LocalizedString>(incoming);
                newLocalizedString.LocalizableId = department.NameId;
                _context.GetSet<LocalizedString>().Add(newLocalizedString);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
         
        if (department.ParentDepartmentId == null)
        {
            var rootStructure = await _context.GetSet<OrganizationStructure>()
                .FirstOrDefaultAsync(s => s.ParentStructureId == null, cancellationToken: cancellationToken);

            if (rootStructure != null)
            {
                var childStructure = await _context.GetSet<OrganizationStructure>()
                    .FirstOrDefaultAsync(s => s.DepartmentId == department.Id, cancellationToken: cancellationToken);
                if (childStructure == null)
                {
                    childStructure = new OrganizationStructure(Guid.NewGuid())
                    {
                        ParentStructureId = rootStructure.Id,
                        DepartmentId = department.Id
                    };
                    await _context.GetSet<OrganizationStructure>().AddAsync(childStructure, cancellationToken);
                    await _context.SaveChangesAsync(cancellationToken);
                }
            }
        }
        else
        {
            var childStructure = await _context.GetSet<OrganizationStructure>()
                .FirstOrDefaultAsync(s => s.DepartmentId == department.Id, cancellationToken: cancellationToken);
            if (childStructure != null)
            {
                _context.GetSet<OrganizationStructure>().Remove(childStructure);
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        
        return Result<UpdateDepartmentResponse>.Success(new UpdateDepartmentResponse());
    }
}
