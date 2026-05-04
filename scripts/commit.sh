#!/usr/bin/env bash
# ============================================================
# commit.sh — Stage & commit changes with a conventional message
# Usage: ./scripts/commit.sh "feat: add pipeline kanban"
#        ./scripts/commit.sh  (interactive prompt)
# ============================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# --- Colours ---
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${CYAN}◆ Uprising AOS — Commit Helper${NC}"
echo "────────────────────────────────"

# Check for changes
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  echo -e "${YELLOW}⚠  Nothing to commit.${NC}"
  exit 0
fi

# Get commit message
if [ -n "${1:-}" ]; then
  MSG="$1"
else
  git status --short
  echo ""
  echo -e "${YELLOW}Enter commit message (conventional: feat|fix|chore|docs|refactor|style|test):${NC}"
  read -r MSG
fi

if [ -z "$MSG" ]; then
  echo -e "${RED}✗ Commit message cannot be empty.${NC}"
  exit 1
fi

# Stage all
git add -A

# Lint before commit (non-blocking)
echo -e "${CYAN}→ Running lint check...${NC}"
if cd uprising-aos && pnpm lint 2>/dev/null; then
  echo -e "${GREEN}✓ Lint passed${NC}"
else
  echo -e "${YELLOW}⚠  Lint warnings (continuing...)${NC}"
fi
cd "$ROOT_DIR"

# Commit
git commit -m "$MSG"

echo -e "${GREEN}✓ Committed: ${MSG}${NC}"
echo -e "  Run ${CYAN}./scripts/push.sh${NC} to push to GitHub."
