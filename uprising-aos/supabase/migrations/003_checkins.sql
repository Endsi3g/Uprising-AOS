CREATE TABLE team_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID REFERENCES team_members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE team_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users full access" ON team_checkins FOR ALL USING (auth.role() = 'authenticated');
