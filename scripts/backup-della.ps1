param(
  [string]$BackupRoot = "D:\DELLA-DAILY-BACKUPS",
  [int]$RetentionDays = 14
)

$ErrorActionPreference = "Stop"

function Ensure-Directory {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
  }
}

function Invoke-Backup {
  param(
    [string]$Source,
    [string]$Destination,
    [string[]]$ExcludedDirectories
  )

  Ensure-Directory -Path $Destination

  $arguments = @(
    $Source,
    $Destination,
    "/E",
    "/R:1",
    "/W:1",
    "/NFL",
    "/NDL",
    "/NP",
    "/XD"
  ) + $ExcludedDirectories

  & robocopy @arguments | Out-Host

  $exitCode = $LASTEXITCODE
  if ($exitCode -ge 8) {
    throw "Backup failed for $Source with robocopy exit code $exitCode."
  }
}

function Remove-OldBackups {
  param(
    [string]$Root,
    [string]$Prefix,
    [int]$Days
  )

  if ($Days -le 0 -or -not (Test-Path -LiteralPath $Root)) {
    return
  }

  $cutoff = (Get-Date).AddDays(-$Days)

  Get-ChildItem -LiteralPath $Root -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "$Prefix-*" -and $_.LastWriteTime -lt $cutoff } |
    ForEach-Object {
      Remove-Item -LiteralPath $_.FullName -Recurse -Force
    }
}

$dateStamp = Get-Date -Format "yyyy-MM-dd"
$appSource = "D:\della-pwa"
$adminSource = "D:\della-admin"

if (-not (Test-Path -LiteralPath $appSource)) {
  throw "App folder not found: $appSource"
}

if (-not (Test-Path -LiteralPath $adminSource)) {
  throw "Admin folder not found: $adminSource"
}

Ensure-Directory -Path $BackupRoot

$appDestination = Join-Path $BackupRoot "della-pwa-$dateStamp"
$adminDestination = Join-Path $BackupRoot "della-admin-$dateStamp"

Write-Host "Starting DELLA backup for $dateStamp" -ForegroundColor Green
Write-Host "Backup root: $BackupRoot"

Invoke-Backup -Source $appSource -Destination $appDestination -ExcludedDirectories @(
  ".git",
  "node_modules",
  ".next",
  ".open-next",
  ".wrangler",
  "out"
)

Invoke-Backup -Source $adminSource -Destination $adminDestination -ExcludedDirectories @(
  ".git",
  "node_modules",
  "dist"
)

Remove-OldBackups -Root $BackupRoot -Prefix "della-pwa" -Days $RetentionDays
Remove-OldBackups -Root $BackupRoot -Prefix "della-admin" -Days $RetentionDays

Write-Host "Backup completed successfully." -ForegroundColor Green
Write-Host "App backup:   $appDestination"
Write-Host "Admin backup: $adminDestination"
