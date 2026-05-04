#!/usr/bin/env bash
# ============================================================
# push.sh — Push current branch to GitHub origin
# Usage: ./scripts/push.sh
#        ./scripts/push.sh --force   (force push, use with care)
# ============================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

FORCE=""
if [[ "${1:-}" == "--force" ]]; then
  echo -e "${RED}⚠  Force push requested. Confirm? (y/N):${NC}"
  read -r CONFIRM
  [[ "$CONFIRM" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }
  FORCE="--force-with-lease"
fi

BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo -e "${CYAN}◆ Uprising AOS — Push to GitHub${NC}"
echo "────────────────────────────────"
echo -e "Branch : ${YELLOW}${BRANCH}${NC}"
echo -e "Remote : $(git remote get-url origin)"
echo ""

# Check unpushed commits
AHEAD=$(git rev-list --count origin/"$BRANCH"..HEAD 2>/dev/null || echo "?")
echo -e "Commits to push: ${YELLOW}${AHEAD}${NC}"

if [[ "$AHEAD" == "0" ]]; then
  echo -e "${YELLOW}⚠  Already up to date.${NC}"
  exit 0
fi

git push origin "$BRANCH" $FORCE

echo -e "${GREEN}✓ Pushed ${AHEAD} commit(s) to origin/${BRANCH}${NC}"
echo -e "  View on GitHub: $(git remote get-url origin | sed 's/\.git$//')/tree/${BRANCH}"
