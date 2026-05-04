# ============================================================
# push.ps1 — Push current branch to GitHub origin
# Usage: .\scripts\push.ps1
#        .\scripts\push.ps1 -Force     (force push with lease)
# ============================================================
param(
    [switch]$Force
)
. (Join-Path $PSScriptRoot "_common.ps1")

Write-Title "Uprising AOS - Push to GitHub"

# ── 1. Deps ──────────────────────────────────────────────────
Assert-CoreDeps

# ── 2. Branch & remote info ──────────────────────────────────
$branch = Get-CurrentBranch
$remote = Get-RemoteUrl
Write-Ok "Branch : $branch"
Write-Ok "Remote : $remote"

# ── 3. Force push confirmation ───────────────────────────────
$forceFlag = @()
if ($Force) {
    Write-Warn "Force push requested!"
    $confirm = Read-Host "  Type YES to confirm"
    if ($confirm -ne "YES") {
        Write-Warn "Aborted."
        exit 0
    }
    $forceFlag = @("--force-with-lease")
}

# ── 4. Check ahead count ─────────────────────────────────────
Write-Step "Fetching remote state..."
git -C $ROOT_DIR fetch origin $branch 2>$null

$ahead = Get-AheadCount $branch
Write-Ok "Commits to push: $ahead"

if ($ahead -eq 0 -and -not $Force) {
    Write-Warn "Already up to date with origin/$branch."
    exit 0
}

# ── 5. Push ──────────────────────────────────────────────────
Write-Step "Pushing to origin/$branch ..."
git -C $ROOT_DIR push origin $branch @forceFlag

$repoUrl = $remote -replace '\.git$', ''
Write-Ok "Pushed $ahead commit(s) to origin/$branch"
Write-Host "  $repoUrl/tree/$branch`n" -ForegroundColor DarkGray
