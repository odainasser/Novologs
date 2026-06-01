global using Ardalis.GuardClauses;
global using AutoMapper;
global using AutoMapper.QueryableExtensions;
global using FluentValidation;
global using MediatR;
global using Microsoft.EntityFrameworkCore;
global using SystemLoaders.Common.Security;
global using Novologs.Domain.Constants;
// Finbuckle.MultiTenant v10 introduced its own `Constants` type; alias to ours to avoid CS0104.
global using Constants = Novologs.Application.Tenant.Constants;
global using Novologs.Application.Modules.Account.Common.Authorization;
global using Novologs.Application.Modules.Account.Common.DTOs;
global using Novologs.Application.Modules.Account.Products.DTOs;
