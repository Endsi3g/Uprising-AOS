# ============================================================
# commit.ps1 — Stage & commit with a conventional message
# Usage: .\scripts\commit.ps1 "feat: add pipeline kanban"
#        .\scripts\commit.ps1          (interactive prompt)
# ============================================================
param(
    [string]$Message = ""
)
. (Join-Path $PSScriptRoot "_common.ps1")

Write-Title "Uprising AOS - Commit"

# ── 1. Deps ──────────────────────────────────────────────────
Assert-CoreDeps
Assert-NodeModules

# ── 2. Check for changes ─────────────────────────────────────
$status = git -C $ROOT_DIR status --porcelain
if ([string]::IsNullOrWhiteSpace($status)) {
    Write-Warn "Nothing to commit - working tree is clean."
    exit 0
}

# ── 3. Get commit message ────────────────────────────────────
if ([string]::IsNullOrWhiteSpace($Message)) {
    Write-Host "`nChanged files:" -ForegroundColor DarkGray
    git -C $ROOT_DIR status --short
    Write-Host ""
    Write-Host "Conventional prefixes: feat | fix | chore | docs | refactor | style | test" -ForegroundColor DarkGray
    $Message = Read-Host "  Commit message"
}

if ([string]::IsNullOrWhiteSpace($Message)) {
    Write-Fail "Commit message cannot be empty."
    exit 1
}

# ── 4. Lint (non-blocking) ───────────────────────────────────
Write-Step "Running lint..."
Push-Location $APP_DIR
try {
    pnpm lint --quiet 2>$null
    Write-Ok "Lint passed."
} catch {
    Write-Warn "Lint warnings detected (continuing)."
}
Pop-Location

# ── 5. Stage & commit ────────────────────────────────────────
Write-Step "Staging all changes..."
git -C $ROOT_DIR add -A

Write-Step "Committing..."
git -C $ROOT_DIR commit -m $Message

Write-Ok "Committed: $Message"
Write-Host "  Run .\scripts\push.ps1 to push to GitHub.`n" -ForegroundColor DarkGray
