-- Migration: Multi-Workspace (SaaS mode)

-- 1. Create Workspaces Table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  owner_id TEXT NOT NULL -- Clerk User ID
);

-- 2. Create Workspace Users Table (Mapping)
CREATE TABLE workspace_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- Clerk User ID
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, user_id)
);

-- 3. Add workspace_id to all operational tables
ALTER TABLE clients ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE deliverables ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE content_posts ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE leads ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE finances ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE deals ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
ALTER TABLE team_members ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- 4. Re-enable RLS with strict workspace filtering
-- Helper function to check if user belongs to workspace
CREATE OR REPLACE FUNCTION public.is_workspace_member(target_workspace_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.workspace_users 
    WHERE workspace_id = target_workspace_id 
    AND user_id = auth.jwt() ->> 'sub' -- Clerk user_id maps to 'sub' in Supabase JWT
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Drop old general policies
DROP POLICY IF EXISTS "Authenticated users full access" ON clients;
DROP POLICY IF EXISTS "Authenticated users full access" ON deliverables;
DROP POLICY IF EXISTS "Authenticated users full access" ON content_posts;
DROP POLICY IF EXISTS "Authenticated users full access" ON leads;
DROP POLICY IF EXISTS "Authenticated users full access" ON finances;
DROP POLICY IF EXISTS "Authenticated users full access" ON team_members;
DROP POLICY IF EXISTS "Authenticated users full access" ON deals;

-- 6. Create new Workspace-aware policies
CREATE POLICY "Workspace restricted access" ON clients FOR ALL USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Workspace restricted access" ON deliverables FOR ALL USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Workspace restricted access" ON content_posts FOR ALL USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Workspace restricted access" ON leads FOR ALL USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Workspace restricted access" ON finances FOR ALL USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Workspace restricted access" ON team_members FOR ALL USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Workspace restricted access" ON deals FOR ALL USING (public.is_workspace_member(workspace_id));
CREATE POLICY "Workspace restricted access" ON workspaces FOR ALL USING (owner_id = auth.jwt() ->> 'sub' OR public.is_workspace_member(id));
CREATE POLICY "Workspace restricted access" ON workspace_users FOR ALL USING (public.is_workspace_member(workspace_id));

-- 7. Enable RLS on new tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;
