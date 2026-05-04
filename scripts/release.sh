#!/usr/bin/env bash
# ============================================================
# release.sh — Bump version, tag, and push a release
# Usage: ./scripts/release.sh patch   → 0.1.0 → 0.1.1
#        ./scripts/release.sh minor   → 0.1.0 → 0.2.0
#        ./scripts/release.sh major   → 0.1.0 → 1.0.0
#        ./scripts/release.sh 1.2.3   (explicit version)
# ============================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT_DIR/uprising-aos"
cd "$ROOT_DIR"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; BLUE='\033[0;34m'; NC='\033[0m'

BUMP="${1:-patch}"

echo -e "${CYAN}◆ Uprising AOS — Release${NC}"
echo "────────────────────────────────"

# Ensure on main and clean
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$BRANCH" != "main" ]]; then
  echo -e "${RED}✗ Releases must be cut from main (currently on ${BRANCH}).${NC}"
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo -e "${RED}✗ Working tree is dirty. Commit or stash changes first.${NC}"
  exit 1
fi

# Get current version from package.json
CURRENT=$(node -p "require('./uprising-aos/package.json').version")
echo -e "Current version: ${YELLOW}v${CURRENT}${NC}"

# Compute next version
if [[ "$BUMP" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  NEXT="$BUMP"
else
  IFS='.' read -r MAJOR MINOR PATCH <<< "$CURRENT"
  case "$BUMP" in
    major) NEXT="$((MAJOR+1)).0.0" ;;
    minor) NEXT="${MAJOR}.$((MINOR+1)).0" ;;
    patch) NEXT="${MAJOR}.${MINOR}.$((PATCH+1))" ;;
    *)
      echo -e "${RED}✗ Unknown bump type: $BUMP (use patch|minor|major or x.y.z)${NC}"
      exit 1
      ;;
  esac
fi

echo -e "Next version   : ${GREEN}v${NEXT}${NC}"
echo ""
echo -e "${YELLOW}Confirm release v${NEXT}? (y/N):${NC}"
read -r CONFIRM
[[ "$CONFIRM" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

# Build check
echo -e "${CYAN}→ Running production build...${NC}"
cd "$APP_DIR"
pnpm build
cd "$ROOT_DIR"
echo -e "${GREEN}✓ Build passed${NC}"

# Bump version in package.json
node -e "
  const fs = require('fs');
  const pkg = JSON.parse(fs.readFileSync('./uprising-aos/package.json', 'utf8'));
  pkg.version = '${NEXT}';
  fs.writeFileSync('./uprising-aos/package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# Commit bump
git add uprising-aos/package.json
git commit -m "chore: release v${NEXT}"

# Tag
git tag -a "v${NEXT}" -m "Uprising AOS v${NEXT}"

# Push
git push origin main --follow-tags

echo ""
echo -e "${GREEN}✓ Released v${NEXT}${NC}"
echo -e "${BLUE}→ GitHub: $(git remote get-url origin | sed 's/\.git$//')/releases/tag/v${NEXT}${NC}"
echo ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "  1. Go to GitHub → Releases → Draft a new release from tag v${NEXT}"
echo -e "  2. Deploy to Vercel: vercel --prod (or auto-deploy if connected)"
