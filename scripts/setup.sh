#!/usr/bin/env bash
# ============================================================
# setup.sh — First-time dev environment setup
# Usage: ./scripts/setup.sh
# ============================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT_DIR/uprising-aos"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

echo -e "${CYAN}"
echo "╔══════════════════════════════════════╗"
echo "║   Uprising Agency OS — Dev Setup     ║"
echo "╚══════════════════════════════════════╝"
echo -e "${NC}"

# ---------- PREREQUISITES ----------
echo -e "${CYAN}→ Checking prerequisites...${NC}"

check_cmd() {
  if command -v "$1" &>/dev/null; then
    echo -e "  ${GREEN}✓ $1$(${2:-} 2>/dev/null | head -1 | grep -oP '[\d.]+' | head -1 | xargs printf " %s")${NC}"
  else
    echo -e "  ${RED}✗ $1 not found — please install it first.${NC}"
    exit 1
  fi
}

check_cmd node "node --version"
check_cmd pnpm "pnpm --version"
check_cmd git "git --version"

# ---------- ENV FILE ----------
echo ""
echo -e "${CYAN}→ Setting up environment...${NC}"

if [ ! -f "$APP_DIR/.env.local" ]; then
  if [ -f "$APP_DIR/.env.local.example" ]; then
    cp "$APP_DIR/.env.local.example" "$APP_DIR/.env.local"
    echo -e "  ${YELLOW}⚠  Created .env.local from example — fill in your API keys!${NC}"
  else
    echo -e "  ${YELLOW}⚠  No .env.local found — create it from NEXT_STEPS.md instructions.${NC}"
  fi
else
  echo -e "  ${GREEN}✓ .env.local exists${NC}"
fi

# ---------- INSTALL DEPS ----------
echo ""
echo -e "${CYAN}→ Installing dependencies...${NC}"
cd "$APP_DIR"
pnpm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# ---------- GIT HOOKS ----------
echo ""
echo -e "${CYAN}→ Configuring git...${NC}"
cd "$ROOT_DIR"
git config core.hooksPath .githooks 2>/dev/null || true

# Make scripts executable
chmod +x scripts/*.sh
echo -e "${GREEN}✓ Scripts are executable${NC}"

# ---------- DONE ----------
echo ""
echo -e "${GREEN}╔══════════════════════════════════════╗"
echo "║   Setup complete!                    ║"
echo -e "╚══════════════════════════════════════╝${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Fill in ${YELLOW}uprising-aos/.env.local${NC} with your API keys"
echo -e "  2. Run ${CYAN}cd uprising-aos && pnpm dev${NC} to start the dev server"
echo -e "  3. Read ${YELLOW}NEXT_STEPS.md${NC} for the full production checklist"
echo ""
