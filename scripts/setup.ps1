# ============================================================
# setup.ps1 — First-time dev environment setup
# Usage: .\scripts\setup.ps1
# Run as: pwsh -ExecutionPolicy Bypass -File .\scripts\setup.ps1
# ============================================================
. "$PSScriptRoot\_common.ps1"

Write-Host @"
`n╔══════════════════════════════════════════╗
║   Uprising Agency OS — Dev Setup          ║
╚══════════════════════════════════════════╝
"@ -ForegroundColor Cyan

# ── 1. Core deps (auto-installs if missing) ──────────────────
Write-Title "1 / Dependencies"
Assert-CoreDeps

# ── 2. Env file ──────────────────────────────────────────────
Write-Title "2 / Environment"
Assert-EnvFile

# ── 3. pnpm install ──────────────────────────────────────────
Write-Title "3 / Node modules"
Write-Step "Installing packages in $APP_DIR ..."
Push-Location $APP_DIR
pnpm install
Pop-Location
Write-Ok "All packages installed."

# ── 4. Git config ────────────────────────────────────────────
Write-Title "4 / Git"
$branch = Get-CurrentBranch
Write-Ok "Branch: $branch"
Write-Ok "Remote: $(Get-RemoteUrl)"

# ── 5. Done ──────────────────────────────────────────────────
Write-Host @"

╔══════════════════════════════════════════╗
║   Setup complete!                         ║
╚══════════════════════════════════════════╝

Next steps:
  1. Edit  uprising-aos\.env.local  with your API keys
  2. Run   cd uprising-aos ; pnpm dev
  3. Read  NEXT_STEPS.md  for the production checklist

"@ -ForegroundColor Green
