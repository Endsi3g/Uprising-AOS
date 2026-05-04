#!/usr/bin/env bash
# ============================================================
# deploy.sh — Build & deploy Uprising AOS to Vercel
# Usage: ./scripts/deploy.sh           → preview deploy
#        ./scripts/deploy.sh --prod    → production deploy
#        ./scripts/deploy.sh --check   → build check only (no deploy)
# ============================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT_DIR/uprising-aos"
cd "$ROOT_DIR"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'

MODE="${1:-preview}"

echo -e "${CYAN}◆ Uprising AOS — Deploy${NC}"
echo "────────────────────────────────"

# ---------- ENV CHECK ----------
REQUIRED_VARS=(
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  CLERK_SECRET_KEY
  ANTHROPIC_API_KEY
)

echo -e "${CYAN}→ Checking environment variables...${NC}"
MISSING=0
for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR:-}" ]; then
    echo -e "  ${RED}✗ Missing: ${VAR}${NC}"
    MISSING=$((MISSING+1))
  else
    echo -e "  ${GREEN}✓ ${VAR}${NC}"
  fi
done

if [ $MISSING -gt 0 ]; then
  echo ""
  echo -e "${RED}✗ ${MISSING} required env var(s) missing.${NC}"
  echo -e "  Copy ${YELLOW}.env.local.example${NC} → ${YELLOW}.env.local${NC} and fill in values."
  echo -e "  For Vercel, add vars via: ${CYAN}vercel env add${NC} or the Vercel dashboard."
  exit 1
fi

# ---------- BUILD ----------
echo ""
echo -e "${CYAN}→ Running production build...${NC}"
cd "$APP_DIR"

if pnpm build; then
  echo -e "${GREEN}✓ Build successful${NC}"
else
  echo -e "${RED}✗ Build failed. Fix errors above before deploying.${NC}"
  exit 1
fi

cd "$ROOT_DIR"

# ---------- CHECK ONLY ----------
if [[ "$MODE" == "--check" ]]; then
  echo -e "${GREEN}✓ Check complete — not deploying (--check mode).${NC}"
  exit 0
fi

# ---------- VERCEL DEPLOY ----------
if ! command -v vercel &>/dev/null; then
  echo -e "${YELLOW}⚠  Vercel CLI not found. Installing globally...${NC}"
  npm install -g vercel
fi

cd "$APP_DIR"

if [[ "$MODE" == "--prod" ]]; then
  echo ""
  echo -e "${YELLOW}→ Deploying to PRODUCTION...${NC}"
  vercel --prod --yes
  echo -e "${GREEN}✓ Production deploy complete!${NC}"
else
  echo ""
  echo -e "${CYAN}→ Deploying preview...${NC}"
  vercel --yes
  echo -e "${GREEN}✓ Preview deploy complete!${NC}"
fi
