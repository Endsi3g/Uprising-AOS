# Uprising Agency OS

> Agency Operating System complet pour Uprising Studio — gérez vos clients, contenu, pipeline, finances et équipe depuis une seule interface.

**Stack :** Next.js 16 · React 19 · TypeScript 5 · Tailwind v4 · shadcn/ui · Supabase · Clerk · Claude API

---

## Modules

| Module | Route | Statut |
|--------|-------|--------|
| Dashboard KPIs | `/os` | Terminé |
| Contenu & Calendrier | `/os/content` | Terminé |
| CRM Clients | `/os/clients` | Terminé |
| Pipeline de Vente | `/os/pipeline` | Terminé |
| Suivi Livrables | `/os/deliverables` | Terminé |
| Prospection & Leads | `/os/prospection` | Terminé |
| Finances & Revenus | `/os/finances` | Terminé |
| Équipe | `/os/team` | Terminé |
| Hub IA Claude | `/os/ai` | Terminé |
| Paramètres | `/os/settings` | Terminé |

---

## Démarrage rapide

```bash
# 1. Setup initial (première fois seulement)
./scripts/setup.sh

# 2. Remplir les variables d'environnement
cp uprising-aos/.env.local.example uprising-aos/.env.local
# → Éditer .env.local avec vos clés API

# 3. Lancer le serveur de dev
cd uprising-aos
pnpm dev
```

L'app tourne sur [http://localhost:3000](http://localhost:3000).

---

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `./scripts/setup.sh` | Setup initial — installe deps, configure l'env |
| `./scripts/commit.sh "message"` | Stage + commit avec message conventionnel |
| `./scripts/push.sh` | Push la branche courante vers GitHub |
| `./scripts/release.sh patch\|minor\|major` | Bump version, tag git, push release |
| `./scripts/deploy.sh` | Build + deploy preview sur Vercel |
| `./scripts/deploy.sh --prod` | Build + deploy production sur Vercel |
| `./scripts/deploy.sh --check` | Build check seulement (pas de deploy) |

---

## Variables d'environnement requises

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/os
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/os

# Claude (Anthropic)
ANTHROPIC_API_KEY=

# Optionnel
BREVO_API_KEY=
TODOIST_API_KEY=
```

---

## Architecture

```
Uprising-AOS/
├── uprising-aos/          # Application Next.js
│   ├── app/
│   │   ├── (auth)/        # Routes Clerk (sign-in, sign-up)
│   │   ├── (os)/          # Routes protégées OS
│   │   └── api/           # API Routes (claude, brevo, todoist)
│   ├── components/
│   │   ├── ui/            # shadcn/ui components
│   │   ├── layout/        # Sidebar, Topbar, CommandPalette
│   │   └── shared/        # DataTable, StatCard, KanbanBoard
│   ├── lib/               # Supabase, Claude, Brevo, Zod validations
│   └── types/             # TypeScript types globaux
├── scripts/               # Scripts deploy/commit/release
├── NEXT_STEPS.md          # Checklist production
└── uprising-agency-os-blueprint-v2.html  # Blueprint original
```

---

## Base de données (Supabase)

6 tables core + 1 table deals :
`clients` · `deliverables` · `content_posts` · `leads` · `finances` · `team_members` · `deals`

Migration SQL : `uprising-aos/supabase/migrations/`

---

## Agents Claude Code intégrés

14 agents du repo `msitarzewski/agency-agents` mappés aux modules :

- **Engineering :** Frontend Developer, Backend Architect, Database Optimizer, Rapid Prototyper
- **Design :** UI Designer
- **Marketing :** Instagram Curator, Content Creator, SEO Specialist
- **Sales :** Outbound Strategist, Deal Strategist, Proposal Strategist
- **PM :** Studio Producer
- **Support :** Analytics Reporter, Agents Orchestrator

---

## Déploiement

```bash
# Preview
./scripts/deploy.sh

# Production
./scripts/deploy.sh --prod
```

Ou connecter le repo GitHub à [Vercel](https://vercel.com) pour auto-deploy sur push vers `main`.

---

**Uprising Studio** · Blueprint v2.0 · Mai 2026
