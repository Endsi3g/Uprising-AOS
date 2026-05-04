# ============================================================
# _common.ps1 — Shared functions & dependency installer
# Dot-source this file in every script: . "$PSScriptRoot\_common.ps1"
# ============================================================

$ErrorActionPreference = "Stop"

# ---------- Colours ----------
function Write-Step  { param($msg) Write-Host "  -> $msg" -ForegroundColor Cyan }
function Write-Ok    { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn  { param($msg) Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Write-Fail  { param($msg) Write-Host "  [FAIL] $msg" -ForegroundColor Red }
function Write-Title { param($msg) Write-Host "`n* $msg" -ForegroundColor Cyan; Write-Host ("-" * 44) -ForegroundColor DarkGray }

# ---------- Paths ----------
$ROOT_DIR = Split-Path $PSScriptRoot -Parent
$APP_DIR  = Join-Path $ROOT_DIR "uprising-aos"

# ---------- Dependency checker/installer ----------
function Assert-Command {
    param(
        [string]$Name,
        [string]$InstallHint = "",
        [scriptblock]$Installer = $null
    )
    if (Get-Command $Name -ErrorAction SilentlyContinue) {
        $ver = (& $Name --version 2>$null) | Select-Object -First 1
        Write-Ok "$Name  $ver"
        return $true
    }
    Write-Warn "$Name not found."
    if ($Installer) {
        Write-Step "Installing $Name..."
        try {
            & $Installer
            if (Get-Command $Name -ErrorAction SilentlyContinue) {
                Write-Ok "$Name installed."
                return $true
            }
        } catch {
            Write-Fail "Auto-install failed: $_"
        }
    }
    if ($InstallHint) { Write-Host "  $InstallHint" -ForegroundColor DarkGray }
    return $false
}

function Install-NodeJS {
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements | Out-Null
    } elseif (Get-Command choco -ErrorAction SilentlyContinue) {
        choco install nodejs-lts -y | Out-Null
    } else {
        Write-Fail "Cannot auto-install Node.js. Download from https://nodejs.org"
        exit 1
    }
    # Refresh PATH
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
}

function Install-Pnpm {
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        npm install -g pnpm | Out-Null
    } else {
        Invoke-WebRequest https://get.pnpm.io/install.ps1 -UseBasicParsing | Invoke-Expression
    }
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
}

function Install-Git {
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        winget install Git.Git --accept-source-agreements --accept-package-agreements | Out-Null
    } elseif (Get-Command choco -ErrorAction SilentlyContinue) {
        choco install git -y | Out-Null
    } else {
        Write-Fail "Cannot auto-install Git. Download from https://git-scm.com"
        exit 1
    }
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
}

function Install-Vercel {
    if (Get-Command pnpm -ErrorAction SilentlyContinue) {
        pnpm add -g vercel | Out-Null
    } elseif (Get-Command npm -ErrorAction SilentlyContinue) {
        npm install -g vercel | Out-Null
    }
}

# ---------- Core dependency check (run in every script) ----------
function Assert-CoreDeps {
    Write-Step "Checking core dependencies..."

    $ok = $true
    $ok = (Assert-Command "node"  "→ https://nodejs.org" { Install-NodeJS }) -and $ok
    $ok = (Assert-Command "pnpm"  "→ npm install -g pnpm" { Install-Pnpm })  -and $ok
    $ok = (Assert-Command "git"   "→ https://git-scm.com" { Install-Git })   -and $ok

    if (-not $ok) {
        Write-Fail "One or more required tools could not be installed. Please install them manually and retry."
        exit 1
    }
}

# ---------- Node modules installer ----------
function Assert-NodeModules {
    param([string]$Dir = $APP_DIR)
    $modulesPath = Join-Path $Dir "node_modules"
    if (-not (Test-Path $modulesPath)) {
        Write-Warn "node_modules not found in $Dir - running pnpm install..."
        Push-Location $Dir
        pnpm install
        Pop-Location
        Write-Ok "Dependencies installed."
    } else {
        Write-Ok "node_modules present."
    }
}

# ---------- Git helpers ----------
function Get-CurrentBranch {
    return (git -C $ROOT_DIR rev-parse --abbrev-ref HEAD 2>$null)
}

function Get-RemoteUrl {
    return (git -C $ROOT_DIR remote get-url origin 2>$null)
}

function Test-WorkingTreeClean {
    $status = git -C $ROOT_DIR status --porcelain
    return [string]::IsNullOrWhiteSpace($status)
}

function Get-AheadCount {
    param([string]$Branch)
    try {
        return [int](git -C $ROOT_DIR rev-list --count "origin/$Branch..HEAD" 2>$null)
    } catch { return 0 }
}

# ---------- Env file checker ----------
function Assert-EnvFile {
    $envFile  = Join-Path $APP_DIR ".env.local"
    $example  = Join-Path $APP_DIR ".env.local.example"

    if (-not (Test-Path $envFile)) {
        if (Test-Path $example) {
            Copy-Item $example $envFile
            Write-Warn ".env.local created from example — fill in your API keys before running!"
        } else {
            Write-Warn ".env.local not found. Create it from NEXT_STEPS.md."
        }
    } else {
        Write-Ok ".env.local found."
    }
}

function Assert-EnvVars {
    param([string[]]$Required)
    Write-Step "Checking environment variables..."

    # Load .env.local
    $envFile = Join-Path $APP_DIR ".env.local"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^\s*([^#=]+)=(.*)$') {
                $k = $matches[1].Trim()
                $v = $matches[2].Trim()
                if (-not [System.Environment]::GetEnvironmentVariable($k)) {
                    [System.Environment]::SetEnvironmentVariable($k, $v, "Process")
                }
            }
        }
    }

    $missing = 0
    foreach ($var in $Required) {
        $val = [System.Environment]::GetEnvironmentVariable($var)
        if ([string]::IsNullOrWhiteSpace($val) -or $val -like "*your-*" -or $val -like "*...*") {
            Write-Fail "Missing or placeholder: $var"
            $missing++
        } else {
            Write-Ok "$var"
        }
    }

    if ($missing -gt 0) {
        Write-Fail "$missing required env var(s) not set. Please check your env file."
        exit 1
    }
}

