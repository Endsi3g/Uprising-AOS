-- Migration 003: KPIs Performance & Compensation

-- 1. Vue pour agréger les livrables par membre
-- Utilisation de SECURITY INVOKER pour respecter les RLS de l'utilisateur
CREATE OR REPLACE VIEW member_deliverables_stats 
WITH (security_invoker = true)
AS
SELECT 
  assigned_to as member_name,
  workspace_id,
  COUNT(*) as total_deliverables,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_deliverables,
  ROUND(AVG(progress)) as avg_progress
FROM deliverables
GROUP BY assigned_to, workspace_id;

-- 2. Vue pour agréger les revenus par membre (basé sur le revenue share)
-- Utilisation de SECURITY INVOKER pour respecter les RLS sur finances et team_members
CREATE OR REPLACE VIEW compensation_estimates 
WITH (security_invoker = true)
AS
SELECT 
  tm.id as member_id,
  tm.name as member_name,
  tm.revenue_share,
  tm.workspace_id,
  COALESCE(
    (SELECT SUM(amount) 
     FROM finances 
     WHERE type = 'revenue' 
     AND workspace_id = tm.workspace_id
     AND date >= date_trunc('month', current_date)
    ), 0
  ) as total_monthly_revenue,
  COALESCE(
    (SELECT SUM(amount) 
     FROM finances 
     WHERE type = 'revenue' 
     AND workspace_id = tm.workspace_id
     AND date >= date_trunc('month', current_date)
    ), 0
  ) * (tm.revenue_share / 100.0) as estimated_compensation
FROM team_members tm
WHERE tm.active = true;
