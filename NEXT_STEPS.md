# Uprising AOS — Checklist Production

> Ce fichier trace chaque étape pour passer du projet actuel à une app production-ready.
> Cocher chaque item au fur et à mesure.

---

## Phase 1 — Infrastructure & Auth `[ Semaines 1–2 ]`

### 1.1 Services externes à créer

- [ ] **Supabase** — Créer un projet sur [supabase.com](https://supabase.com)
  - [ ] Copier `SUPABASE_URL` et `SUPABASE_ANON_KEY` dans `.env.local`
  - [ ] Exécuter la migration : `uprising-aos/supabase/migrations/001_initial.sql` dans le SQL Editor
  - [ ] Activer Supabase Realtime pour les tables `deliverables` et `deals`
  - [ ] Créer un bucket Storage nommé `contracts` (public: false)

- [ ] **Clerk** — Créer une app sur [clerk.com](https://clerk.com)
  - [ ] Copier `PUBLISHABLE_KEY` et `SECRET_KEY` dans `.env.local`
  - [ ] Configurer les URLs de redirect : `/sign-in`, `/sign-up`, `/os`
  - [ ] Créer 2 utilisateurs : Kael (admin) et Xavier (member)
  - [ ] Configurer les rôles RBAC : `founder` / `ops`

- [ ] **Anthropic** — Obtenir une clé API sur [console.anthropic.com](https://console.anthropic.com)
  - [ ] Ajouter `ANTHROPIC_API_KEY` dans `.env.local`
  - [ ] Tester `/api/claude` avec Postman ou depuis le Hub IA

### 1.2 Variables d'environnement

- [ ] Toutes les vars de `.env.local` sont renseignées
- [ ] Vérifier avec `./scripts/deploy.sh --check`
- [ ] Ajouter les vars sur Vercel (Settings → Environment Variables)

### 1.3 Middleware & Sécurité

- [ ] `middleware.ts` protège toutes les routes `/os/**`
- [ ] Tester que `/os` redirige vers `/sign-in` si non connecté
- [ ] Tester que `/sign-in` redirige vers `/os` si déjà connecté

---

## Phase 2 — Modules Critiques `[ Semaines 3–4 ]`

### 2.1 Module Contenu (`/os/content`)

- [ ] Remplacer les `MOCK_POSTS` par des données Supabase réelles
  - [ ] Server Component : `createClient()` de `lib/supabase/server.ts`
  - [ ] Query : `SELECT * FROM content_posts ORDER BY created_at DESC`
- [ ] Kanban drag & drop avec `@hello-pangea/dnd`
  - [ ] Créer `components/shared/kanban-board.tsx` avec DragDropContext
  - [ ] Mutation Supabase au drop : `UPDATE content_posts SET status = $1 WHERE id = $2`
- [ ] Calendrier visuel dans l'onglet Calendar
  - [ ] Utiliser le composant `Calendar` de shadcn/ui
  - [ ] Afficher les posts par date de publication
- [ ] Générateur Claude fonctionnel
  - [ ] Tester `POST /api/claude` avec type `hook`, `script`
  - [ ] Streaming responses (upgrade `route.ts` avec `StreamingTextResponse`)
- [ ] Compteur TOF/MOF auto avec alerte si ratio < 70%

### 2.2 Module CRM (`/os/clients`)

- [ ] Remplacer `MOCK_CLIENTS` par Supabase
  - [ ] `SELECT * FROM clients WHERE status = 'active'`
- [ ] Page `clients/new` — Form complet avec validation Zod
  - [ ] `useForm` + `zodResolver(clientSchema)`
  - [ ] Server Action : `INSERT INTO clients`
- [ ] Page `clients/[id]` — Fiche client complète
  - [ ] Tabs : Infos / Livrables / Revenus / Communications
  - [ ] Timeline des communications
  - [ ] Upload contrat (Supabase Storage)
- [ ] Résumé call via Claude : paste transcription → résumé structuré

### 2.3 Module Livrables (`/os/deliverables`)

- [ ] Remplacer `MOCK_DELIVERABLES` par Supabase
  - [ ] `SELECT d.*, c.name as client_name FROM deliverables d JOIN clients c ON d.client_id = c.id`
- [ ] `is_late` calculé automatiquement par PostgreSQL (GENERATED ALWAYS AS)
- [ ] Checkbox toggle → `UPDATE deliverables SET status = 'completed', progress = 100`
- [ ] Page `deliverables/[id]` — Détail + commentaires Realtime
- [ ] Notifications browser (Notification API) si deadline dans 48h

---

## Phase 3 — Revenue Engine `[ Semaines 5–6 ]`

### 3.1 Module Pipeline (`/os/pipeline`)

- [ ] Remplacer `MOCK_DEALS` par Supabase (`deals` table)
- [ ] Drag & drop entre colonnes avec `@hello-pangea/dnd`
- [ ] Sheet latéral pour créer/éditer un deal
  - [ ] Champs : nom, entreprise, valeur, stage, probabilité, notes
- [ ] Alerte Supabase Realtime si deal sans mouvement > 7 jours
- [ ] Bouton "Générer proposition Trifecta" → Hub IA → Claude

### 3.2 Module Finances (`/os/finances`)

- [ ] Remplacer mock data par Supabase
  - [ ] `SELECT * FROM finances ORDER BY date DESC`
- [ ] Calcul MRR : `SUM(amount) WHERE type = 'revenue' AND date >= date_trunc('month', now())`
- [ ] Page `finances/invoices` — DataTable avec statuts
  - [ ] Export CSV : `Array → CSV → Blob → download`
- [ ] Charts recharts avec vraies données

### 3.3 Module Prospection (`/os/prospection`)

- [ ] Remplacer `MOCK_LEADS` par Supabase
- [ ] Import CSV — FileReader API → parse → bulk INSERT
- [ ] Page `prospection/campaigns` — API Brevo
  - [ ] `GET /api/brevo` → afficher KPIs ouverture/réponse
- [ ] Générateur email froid Claude fonctionnel (déjà partiellement fait)

---

## Phase 4 — Équipe & Intégrations `[ Semaines 7–8 ]`

### 4.1 Module Équipe (`/os/team`)

- [ ] Lier Clerk users aux `team_members` Supabase via `clerk_user_id`
- [ ] Page `team/[id]` — Profil membre
  - [ ] Check-ins hebdo : form Textarea → INSERT
  - [ ] Compensation tracker : revenue_share %
- [ ] KPIs par membre : livrables complétés, leads scrapés

### 4.2 Dashboard KPIs final (`/os`)

- [ ] Toutes les stats depuis Supabase (pas mock)
- [ ] Daily briefing Claude — généré au chargement (Server Component)
  - [ ] Requête des KPIs → `contentPrompts.dailyBriefing(data)` → afficher
- [ ] Command Palette Cmd+K étendue
  - [ ] Actions rapides : créer post, créer lead, générer email

### 4.3 Intégrations API

- [ ] **Brevo** : `GET /api/brevo` → stats campagnes auto
- [ ] **Todoist** : `GET /api/todoist` → tâches Xavier
  - [ ] Créer `lib/todoist.ts` avec l'API REST
  - [ ] Afficher dans module Team
- [ ] **Metricool** : stats Instagram Reels (si API disponible)

---

## Phase 5 — Polish & Production `[ Semaines 9–10 ]`

### 5.1 Qualité & Performance

- [ ] Tous les TypeScript errors résolus : `pnpm tsc --noEmit`
- [ ] Lint clean : `pnpm lint`
- [ ] Build production OK : `pnpm build`
- [ ] Suspense boundaries + Skeleton sur tous les fetches
- [ ] Error boundaries (`error.tsx`) sur chaque module
- [ ] Loading states (`loading.tsx`) sur chaque route
- [ ] Metadata SEO sur chaque page (`export const metadata`)

### 5.2 Responsive & UX

- [ ] Sidebar collapse sur mobile (Sheet/Drawer)
- [ ] DataTables scrollable sur mobile
- [ ] Kanban scrollable horizontalement sur mobile
- [ ] Dark/Light toggle fonctionnel (next-themes)
  - [ ] Ajouter `ThemeProvider` dans `app/layout.tsx`
  - [ ] Switch dans Settings connecté

### 5.3 Sécurité

- [ ] RLS Policies Supabase vérifiées pour chaque table
- [ ] Variables d'env côté server uniquement (pas de `NEXT_PUBLIC_` pour les secrets)
- [ ] Rate limiting sur `/api/claude` (ex: 10 req/min)
  - [ ] Utiliser Upstash Redis ou simple in-memory Map
- [ ] Validation Zod sur tous les POST handlers

### 5.4 Deploy Vercel

- [ ] Repo GitHub connecté à Vercel (auto-deploy sur push main)
- [ ] Variables d'env configurées dans Vercel dashboard
- [ ] Domain custom configuré (si applicable)
- [ ] `./scripts/release.sh minor` pour couper la v0.1.0
- [ ] `./scripts/deploy.sh --prod` pour le premier deploy prod

---

## Fonctionnalités Bonus (Post-v1)

- [ ] Rapport client PDF — `react-pdf` ou Puppeteer → génération via Claude
- [ ] Supabase Realtime — notifications live pour livrables et deals
- [ ] Import/export complet (JSON backup de toute la DB)
- [ ] Multi-workspace (si l'OS est vendu à d'autres agences)
- [ ] App mobile PWA — `next-pwa` + manifest
- [ ] Webhook Brevo → update statut lead automatiquement
- [ ] Showreel component sur la landing (composant `@arc/showreel` déjà fourni)

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
