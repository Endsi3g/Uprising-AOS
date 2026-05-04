# ============================================================
# release.ps1 — Bump version, tag, build-check & push release
# Usage: .\scripts\release.ps1 patch       → 0.1.0 → 0.1.1
#        .\scripts\release.ps1 minor       → 0.1.0 → 0.2.0
#        .\scripts\release.ps1 major       → 0.1.0 → 1.0.0
#        .\scripts\release.ps1 1.2.3       (explicit version)
# ============================================================
param(
    [string]$Bump = "patch"
)
. (Join-Path $PSScriptRoot "_common.ps1")

Write-Title "Uprising AOS - Release"

# ── 1. Deps ──────────────────────────────────────────────────
Assert-CoreDeps
Assert-NodeModules

# ── 2. Must be on main & clean ───────────────────────────────
$branch = Get-CurrentBranch
if ($branch -ne "main") {
    Write-Fail "Releases must be cut from 'main' (currently on '$branch')."
    Write-Host "  Run: git checkout main" -ForegroundColor DarkGray
    exit 1
}
if (-not (Test-WorkingTreeClean)) {
    Write-Fail "Working tree is dirty. Commit or stash changes first."
    exit 1
}

# ── 3. Compute next version ──────────────────────────────────
$pkgPath = Join-Path $APP_DIR "package.json"
$pkg     = Get-Content $pkgPath -Raw | ConvertFrom-Json
$current = $pkg.version

Write-Ok "Current version: v$current"

if ($Bump -match '^\d+\.\d+\.\d+$') {
    $next = $Bump
} else {
    $parts = $current -split '\.'
    [int]$major = $parts[0]; [int]$minor = $parts[1]; [int]$patch = $parts[2]

    switch ($Bump) {
        "major" { $next = "$($major+1).0.0" }
        "minor" { $next = "$major.$($minor+1).0" }
        "patch" { $next = "$major.$minor.$($patch+1)" }
        default {
            Write-Fail "Unknown bump type '$Bump'. Use: patch | minor | major | x.y.z"
            exit 1
        }
    }
}

Write-Ok "Next version   : v$next"

# ── 4. Confirm ───────────────────────────────────────────────
$confirm = Read-Host "`n  Release v$next ? (y/N)"
if ($confirm -notmatch '^[Yy]$') {
    Write-Warn "Aborted."
    exit 0
}

# ── 5. pnpm install (ensure fresh) ───────────────────────────
Write-Title "Installing dependencies..."
Push-Location $APP_DIR
pnpm install
Pop-Location

# ── 6. Production build check ────────────────────────────────
Write-Title "Build check"
Write-Step "Running pnpm build..."
Push-Location $APP_DIR
try {
    pnpm build
    Write-Ok "Build passed."
} catch {
    Write-Fail "Build failed — fix errors before releasing."
    Pop-Location
    exit 1
}
Pop-Location

# ── 7. Bump package.json ─────────────────────────────────────
Write-Title "Tagging v$next"
Write-Step "Bumping package.json..."
$pkg.version = $next
$pkg | ConvertTo-Json -Depth 10 | Set-Content $pkgPath -Encoding UTF8
Write-Ok "package.json → v$next"

# ── 8. Commit + tag ──────────────────────────────────────────
Write-Step "Committing version bump..."
git -C $ROOT_DIR add (Join-Path "uprising-aos" "package.json")
git -C $ROOT_DIR commit -m "chore: release v$next"

Write-Step "Creating annotated tag v$next ..."
git -C $ROOT_DIR tag -a "v$next" -m "Uprising AOS v$next"

# ── 9. Push ──────────────────────────────────────────────────
Write-Step "Pushing main + tags..."
git -C $ROOT_DIR push origin main --follow-tags

$repoUrl = (Get-RemoteUrl) -replace '\.git$', ''
Write-Host @"

╔══════════════════════════════════════════╗
  Released v$next
╚══════════════════════════════════════════╝

  GitHub release : $repoUrl/releases/tag/v$next

Next steps:
  1. Go to GitHub → Releases → Draft release from tag v$next
  2. Deploy prod : .\scripts\deploy.ps1 -Prod

"@ -ForegroundColor Green
