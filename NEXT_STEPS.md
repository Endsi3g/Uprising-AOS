# Uprising AOS — Checklist Production

> Ce fichier trace chaque étape pour passer du projet actuel à une app production-ready.
> Cocher chaque item au fur et à mesure.

---

## Phase 1 — Infrastructure & Auth `[ Semaines 1–2 ]`

### 1.1 Services externes à créer

- [ ] **Supabase** — Créer un projet sur [supabase.com](https://supabase.com)
  - [ ] Copier `SUPABASE_URL` et `SUPABASE_ANON_KEY` dans `.env.local`
- [x] **Supabase** — Créer un projet sur [supabase.com](https://supabase.com)
  - [x] Copier `SUPABASE_URL` et `SUPABASE_ANON_KEY` dans `.env.local`
  - [x] Exécuter la migration : `uprising-aos/supabase/migrations/001_initial.sql` dans le SQL Editor
  - [x] Activer Supabase Realtime pour les tables `deliverables` et `deals`
  - [x] Créer un bucket Storage nommé `contracts` (public: false)

- [x] **Clerk** — Créer une app sur [clerk.com](https://clerk.com)
  - [x] Copier `PUBLISHABLE_KEY` et `SECRET_KEY` dans `.env.local`
  - [x] Configurer les URLs de redirect : `/sign-in`, `/sign-up`, `/os`
  - [x] Créer 2 utilisateurs : Kael (admin) et Xavier (member)
  - [x] Configurer les rôles RBAC : `founder` / `ops`

- [x] **Anthropic** — Obtenir une clé API sur [console.anthropic.com](https://console.anthropic.com)
  - [x] Ajouter `ANTHROPIC_API_KEY` dans `.env.local`
  - [x] Tester `/api/claude` avec Postman ou depuis le Hub IA

### 1.2 Variables d'environnement

- [x] Toutes les vars de `.env.local` sont renseignées
- [x] Vérifier avec `./scripts/deploy.sh --check`
- [x] Ajouter les vars sur Vercel (Settings → Environment Variables)

### 1.3 Middleware & Sécurité

- [x] `middleware.ts` protège toutes les routes `/os/**`
- [x] Tester que `/os` redirige vers `/sign-in` si non connecté
- [x] Tester que `/sign-in` redirige vers `/os` si déjà connecté

---

## Phase 2 — Modules Critiques

### 2.1 Module Contenu (`/os/content`)

- [x] Remplacer les `MOCK_POSTS` par des données Supabase réelles
  - [x] Server Component : `createClient()` de `lib/supabase/server.ts`
  - [x] Query : `SELECT * FROM content_posts ORDER BY created_at DESC`
- [x] Kanban drag & drop avec `@hello-pangea/dnd`
  - [x] Créer `components/shared/kanban-board.tsx` avec DragDropContext
  - [x] Mutation Supabase au drop : `UPDATE content_posts SET status = $1 WHERE id = $2`
- [x] Calendrier visuel dans l'onglet Calendar
  - [x] Utiliser le composant `Calendar` de shadcn/ui
  - [x] Afficher les posts par date de publication
- [x] Générateur Claude fonctionnel
  - [x] Tester `POST /api/claude` avec type `hook`, `script`
  - [x] Streaming responses (upgrade `route.ts` avec `StreamingTextResponse`)
- [x] Compteur TOF/MOF auto avec alerte si ratio < 70%

### 2.2 Module CRM (`/os/clients`)

- [x] Remplacer `MOCK_CLIENTS` par Supabase
  - [x] `SELECT * FROM clients WHERE status = 'active'`
- [x] Page `clients/new` — Form complet avec validation Zod
  - [x] `useForm` + `zodResolver(clientSchema)`
  - [x] Server Action : `INSERT INTO clients`
- [x] Page `clients/[id]` — Fiche client complète
  - [x] Tabs : Infos / Livrables / Revenus / Communications
  - [x] Timeline des communications
  - [x] Upload contrat (Supabase Storage)
- [x] Résumé call via Claude : paste transcription → résumé structuré

### 2.3 Module Livrables (`/os/deliverables`)

- [x] Remplacer `MOCK_DELIVERABLES` par Supabase
  - [x] `SELECT d.*, c.name as client_name FROM deliverables d JOIN clients c ON d.client_id = c.id`
- [x] `is_late` calculé automatiquement par PostgreSQL (GENERATED ALWAYS AS)
- [x] Checkbox toggle → `UPDATE deliverables SET status = 'completed', progress = 100`
- [x] Page `deliverables/[id]` — Détail + commentaires Realtime
- [x] Notifications browser (Notification API) si deadline dans 48h

---

## Phase 3 — Revenue Engine `[ Semaines 5–6 ]`

### 3.1 Module Pipeline (`/os/pipeline`)

- [x] Remplacer `MOCK_DEALS` par Supabase (`deals` table)
- [x] Drag & drop entre colonnes avec `@hello-pangea/dnd`
- [x] Sheet latéral pour créer/éditer un deal
  - [x] Champs : nom, entreprise, valeur, stage, probabilité, notes
- [x] Alerte Supabase Realtime si deal sans mouvement > 7 jours
- [x] Bouton "Générer proposition Trifecta" → Hub IA → Claude

### 3.2 Module Finances (`/os/finances`)

- [x] Remplacer mock data par Supabase
  - [x] `SELECT * FROM finances ORDER BY date DESC`
- [x] Calcul MRR : `SUM(amount) WHERE type = 'revenue' AND date >= date_trunc('month', now())`
- [x] Page `finances/invoices` — DataTable avec statuts
  - [x] Export CSV : `Array → CSV → Blob → download`
- [x] Charts recharts avec vraies données

### 3.3 Module Prospection (`/os/prospection`)

- [x] Remplacer `MOCK_LEADS` par Supabase
- [x] Import CSV — FileReader API → parse → bulk INSERT
- [x] Page `prospection/campaigns` — API Brevo
  - [x] `GET /api/brevo` → afficher KPIs ouverture/réponse
- [x] Générateur email froid Claude fonctionnel

---

## Phase 4 — Équipe & Intégrations `[ Semaines 7–8 ]`

### 4.1 Module Équipe (`/os/team`)

- [x] Lier Clerk users aux `team_members` Supabase via `clerk_user_id`
- [x] Page `team/[id]` — Profil membre
  - [x] Check-ins hebdo : form Textarea → INSERT
  - [ ] Compensation tracker : revenue_share %
- [ ] KPIs par membre : livrables complétés, leads scrapés (en cours)

### 4.2 Dashboard KPIs final (`/os`)

- [x] Toutes les stats depuis Supabase (pas mock)
- [x] Daily briefing Claude — généré au chargement (Server Component)
  - [x] Requête des KPIs → `contentPrompts.dailyBriefing(data)` → afficher
- [x] Command Palette Cmd+K étendue
  - [x] Actions rapides : créer post, créer lead, générer email

### 4.3 Intégrations API

- [x] **Brevo** : `GET /api/brevo` → stats campagnes auto
- [x] **Todoist** : `GET /api/todoist` → tâches Xavier
  - [x] Créer `lib/todoist.ts` avec l'API REST
  - [x] Afficher dans dashboard et module Team
- [ ] **Metricool** : stats Instagram Reels (en attente API)

---

## Phase 5 — Polish & Production `[ Semaines 9–10 ]`

### 5.1 Qualité & Performance

- [x] Tous les TypeScript errors résolus : `pnpm tsc --noEmit`
- [x] Lint clean : `pnpm lint`
- [x] Build production OK : `pnpm build`
- [x] Suspense boundaries + Skeleton sur tous les fetches
- [x] Error boundaries (`error.tsx`) sur chaque module
- [x] Loading states (`loading.tsx`) sur chaque route
- [x] Metadata SEO sur chaque page (`export const metadata`)

### 5.2 Responsive & UX

- [x] Sidebar collapse sur mobile (Sheet/Drawer)
- [x] DataTables scrollable sur mobile
- [x] Kanban scrollable horizontalement sur mobile
- [x] Dark/Light toggle fonctionnel (next-themes)
  - [x] Ajouter `ThemeProvider` dans `app/layout.tsx`
  - [x] Switch dans Settings connecté

### 5.3 Sécurité

- [x] RLS Policies Supabase vérifiées pour chaque table
- [x] Variables d'env côté server uniquement (pas de `NEXT_PUBLIC_` pour les secrets)
- [x] Rate limiting sur `/api/claude` (ex: 10 req/min)
  - [x] Utiliser Upstash Redis ou simple in-memory Map
- [x] Validation Zod sur tous les POST handlers

### 5.4 Deploy Vercel
- [x] Repo GitHub connecté à Vercel (auto-deploy sur push main)
- [x] Variables d'env configurées dans Vercel dashboard
- [x] Domain custom configuré (si applicable)
- [x] `./scripts/release.sh minor` pour couper la v0.1.0
- [x] `./scripts/deploy.sh --prod` pour le premier deploy prod

---

## Fonctionnalités Bonus (Phase 6) — Production Ready `[ Terminé ]`

- [x] Rapport client PDF — `@react-pdf/renderer` → génération dynamique
- [x] Supabase Realtime — notifications live (Sonner) pour livrables et deals
- [x] Import/export complet (JSON backup de toute la DB dans Settings)
- [x] Multi-workspace (SaaS) — isolation complète via RLS & WorkspaceSwitcher
- [x] App mobile PWA — `@ducanh2912/next-pwa` + manifest + assets
- [x] Webhook Brevo — synchronisation auto des statuts de leads
- [x] Showreel component — intégration vidéo immersive sur la landing page
- [x] CI/CD Automation — GitHub Actions + Tests E2E Puppeteer

---

## Commandes utiles

```bash
# Dev
cd uprising-aos && pnpm dev

# Vérifier le build
./scripts/deploy.sh --check

# Committer
./scripts/commit.sh "feat: add pipeline drag and drop"

# Pusher
./scripts/push.sh

# Release
./scripts/release.sh minor   # 0.1.0 → 0.2.0

# Deploy prod
./scripts/deploy.sh --prod
```

---

*Uprising Studio · Agency OS v0.1.0 · Mai 2026*
