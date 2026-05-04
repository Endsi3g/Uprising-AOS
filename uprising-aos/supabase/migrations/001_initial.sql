-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pro_bono', 'paid')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived')),
  services TEXT[] DEFAULT '{}',
  contract_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliverables
CREATE TABLE deliverables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed')),
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  assigned_to TEXT NOT NULL,
  deadline DATE NOT NULL,
  is_late BOOLEAN GENERATED ALWAYS AS (deadline < CURRENT_DATE AND status != 'completed') STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Posts
CREATE TABLE content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('TOF', 'MOF', 'BOF')),
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'script', 'filming', 'editing', 'published')),
  script TEXT,
  publish_date DATE,
  views INT DEFAULT 0,
  platform TEXT NOT NULL DEFAULT 'instagram' CHECK (platform IN ('instagram', 'tiktok')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company TEXT NOT NULL,
  city TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  site_quality TEXT NOT NULL CHECK (site_quality IN ('outdated', 'ok', 'none')),
  status TEXT NOT NULL DEFAULT 'cold' CHECK (status IN ('cold', 'email_1', 'email_2', 'email_3', 'replied', 'call')),
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Finances
CREATE TABLE finances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('revenue', 'expense')),
  amount DECIMAL(10,2) NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  invoice_status TEXT CHECK (invoice_status IN ('sent', 'paid', 'pending')),
  is_recurring BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('founder', 'ops', 'sales')),
  revenue_share DECIMAL(5,2) DEFAULT 0,
  skills TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE
);

-- Deals (Pipeline)
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  stage TEXT NOT NULL DEFAULT 'prospect' CHECK (stage IN ('prospect', 'discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'on_hold')),
  probability INT DEFAULT 20 CHECK (probability >= 0 AND probability <= 100),
  contact_email TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (basic RLS)
CREATE POLICY "Authenticated users full access" ON clients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON deliverables FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON content_posts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON leads FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON finances FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON team_members FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users full access" ON deals FOR ALL USING (auth.role() = 'authenticated');
