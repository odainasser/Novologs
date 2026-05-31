<#
  start.ps1 — run the Novologs API (HTTPS) and the Next.js frontend (HTTPS) together.

  Usage:   pwsh ./start.ps1

  - API      : https://localhost:5443  (Swagger at /swagger)   + http://localhost:5080
  - Frontend : https://localhost:3035
  Press Ctrl+C to stop both.
#>
$ErrorActionPreference = 'Stop'
$root  = $PSScriptRoot
$certs = Join-Path $root 'Web\certs'

Write-Host "Ensuring ASP.NET Core dev HTTPS certificate is trusted..." -ForegroundColor Cyan
dotnet dev-certs https --trust | Out-Null

# Export the (trusted) dev cert as PEM for the Next.js dev server if not present.
if (-not (Test-Path (Join-Path $certs 'localhost.pem'))) {
  Write-Host "Exporting HTTPS cert for the frontend -> Web/certs ..." -ForegroundColor Cyan
  New-Item -ItemType Directory -Force -Path $certs | Out-Null
  dotnet dev-certs https -ep (Join-Path $certs 'localhost.pem') --format PEM --no-password | Out-Null
}

# Start the API (HTTPS + HTTP) in the background.
Write-Host "Starting API  -> https://localhost:5443" -ForegroundColor Green
$api = Start-Process -FilePath 'dotnet' -PassThru -WorkingDirectory $root -ArgumentList @(
  'run', '--project', 'Api/Novologs.Api.csproj',
  '--urls', 'https://localhost:5443;http://localhost:5080'
)

try {
  # Run the frontend (HTTPS) in the foreground; Ctrl+C here stops everything.
  Write-Host "Starting Web  -> https://localhost:3035" -ForegroundColor Green
  Push-Location (Join-Path $root 'Web')
  try { npm run dev:https }
  finally { Pop-Location }
}
finally {
  Write-Host "Stopping API..." -ForegroundColor Yellow
  if ($api -and -not $api.HasExited) { Stop-Process -Id $api.Id -Force -ErrorAction SilentlyContinue }
}
