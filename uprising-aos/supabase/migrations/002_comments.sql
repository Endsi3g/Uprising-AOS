-- Comments for Deliverables
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deliverable_id UUID REFERENCES deliverables(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (basic RLS)
CREATE POLICY "Authenticated users full access" ON comments FOR ALL USING (auth.role() = 'authenticated');
