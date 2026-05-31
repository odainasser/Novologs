# Novologs

Novologs is a multi-tenant **business-management / ERP** platform — Finance & Accounting,
CRM (clients & leads), Projects & Tasks, Documents/Files, Procurement, HR-lite, and
team Chat — with a **.NET 9** backend (single **modular monolith**, Clean Architecture +
CQRS) and a **Next.js** frontend.

> Rebuilt from a prior 13-service distributed monolith into one clean, single-database
> solution. See the git history (`refactor/modular-monolith`) for the migration.

## Repository layout

All projects live at the repository root (no `src/` folder):

```
Novologs.sln
├─ Domain/          Entities, enums, value objects, domain events (no dependencies)
├─ Application/     CQRS use cases (MediatR Commands/Queries + Validators + Authorizers),
│                   Result<T>, behaviours (validation, authorization, unhandled-exception),
│                   feature folders under Modules/<Module> (+ shared code under Shared/Tenant)
├─ Infrastructure/  EF Core (ApplicationDbContext), Identity, repositories, file storage,
│                   licensing, Hangfire, Finbuckle multitenancy, JWT key service
├─ Api/             Minimal-API host: endpoint groups, Swagger (+ JWT), auth, DI wiring
└─ Web/             Next.js 14 frontend (React + TypeScript)
```

`Directory.Build.props`, `Directory.Packages.props` (central package management),
`global.json` (pins the .NET 9 SDK), and `.config/` (pinned `dotnet-ef` tool) are also at the root.

## Backend

### Architecture
- **Modules** are feature folders inside the layers (Identity/Tenancy, Projects, CRM,
  Documents, Finance/Accounting, Collaboration, …) — not separate projects.
- **CQRS** via MediatR; every request flows through Validation → Authorization →
  Unhandled-exception behaviours.
- **Authorization is permission-based** (`User.HasPermission(...)`); permissions are granted
  via roles (`RolePermission`) and/or directly to users (`UserPermission`); `SuperAdmin`
  bypasses all checks.
- **Single shared database** (tenancy model B): one `ApplicationDbContext`
  (`IdentityDbContext`); Finbuckle resolves the tenant against the same DB
  (a default tenant is seeded for local dev).

### Tech stack
- .NET 9, ASP.NET Core minimal APIs
- EF Core 9 + **SQL Server** (LocalDB for local dev)
- MediatR, FluentValidation, AutoMapper
- ASP.NET Core Identity + **JWT Bearer** (RS256)
- Finbuckle.MultiTenant, Hangfire (SQL Server storage), Serilog
- Swagger / Swashbuckle

### Prerequisites
- .NET SDK **9.0.x** (pinned via `global.json`)
- SQL Server **LocalDB** (`(localdb)\MSSQLLocalDB`) — ships with Visual Studio / SQL Server Express

### Database
Connection string is in `Api/appsettings.json` → `(localdb)\MSSQLLocalDB`, database `NovologsDb`.
Apply migrations:

```powershell
dotnet tool restore                      # restores the pinned dotnet-ef tool
dotnet tool run dotnet-ef database update --project Infrastructure --startup-project Api
```

> In Development the app also auto-seeds a default tenant and a SuperAdmin login on startup.

### Run the API

```powershell
dotnet build Novologs.sln
dotnet run --project Api/Novologs.Api.csproj      # http://localhost:5080
```

Swagger: **http://localhost:5080/swagger**

### Authentication
1. `POST /auth/login`:
   ```json
   { "usernameOrEmail": "administrator@localhost", "password": "Administrator1!" }
   ```
2. Copy the returned `token`, click **Authorize** in Swagger, enter `Bearer <token>`.
3. Secured endpoints return `401` without a token and execute with a valid one.

### Migrations
```powershell
dotnet tool run dotnet-ef migrations add <Name> --project Infrastructure --startup-project Api --output-dir Data/Migrations
dotnet tool run dotnet-ef database update        --project Infrastructure --startup-project Api
```

## Frontend (`Web/`)

Next.js 14 + React + TypeScript. It talks to the API via `NEXT_PUBLIC_ZETA_API_URL`
(`Web/.env`, default `http://localhost:5080`).

```powershell
cd Web
npm install        # uses .npmrc (legacy-peer-deps) for the MUI peer set
npm run dev        # http://localhost:3035  → calls the API on :5080
```

The API enables permissive CORS in development, so the dev frontend can call it directly.

## Run both (single command, HTTPS)

```powershell
pwsh ./start.ps1
```
Starts both over HTTPS (trusts the ASP.NET dev cert and exports it for Next on first run):
- **API**  → https://localhost:5443  (Swagger at `/swagger`)  + http://localhost:5080
- **Web**  → https://localhost:3035

`Ctrl+C` stops both. Sign in with `administrator@localhost` / `Administrator1!`.

> Run them separately if you prefer:
> `dotnet run --project Api/Novologs.Api.csproj` and `cd Web && npm run dev:https`.

## Notes
- `Api/private_key.pem` is a **development** RSA key used to sign JWTs. Supply a real key
  out-of-band for any non-local environment and do not commit it.
- AI / MCP tooling from the legacy stack is intentionally **not** included.
- No Docker — the solution runs directly via `dotnet` and `npm`.
