export type ClientType = 'pro_bono' | 'paid'
export type ClientStatus = 'active' | 'archived'
export type DeliverableStatus = 'pending' | 'in_progress' | 'review' | 'completed'
export type ContentType = 'TOF' | 'MOF' | 'BOF'
export type ContentStatus = 'idea' | 'script' | 'filming' | 'editing' | 'published'
export type LeadStatus = 'cold' | 'email_1' | 'email_2' | 'email_3' | 'replied' | 'call'
export type SiteQuality = 'outdated' | 'ok' | 'none'
export type InvoiceStatus = 'sent' | 'pending' | 'paid'
export type TeamRole = 'founder' | 'ops' | 'sales'
export type PipelineStage = 'prospect' | 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost' | 'on_hold'

export interface Client {
  id: string
  name: string
  email: string
  type: ClientType
  status: ClientStatus
  services: string[]
  contract_url?: string
  created_at: string
}

export interface Deliverable {
  id: string
  client_id: string
  title: string
  status: DeliverableStatus
  progress: number
  assigned_to: string
  deadline: string
  is_late: boolean
  client?: Client
}

export interface ContentPost {
  id: string
  title: string
  type: ContentType
  status: ContentStatus
  script?: string
  publish_date?: string
  views: number
  platform: 'instagram' | 'tiktok'
  created_at: string
}

export interface Lead {
  id: string
  company: string
  city: string
  email: string
  website?: string
  site_quality: SiteQuality
  status: LeadStatus
  is_premium: boolean
  created_at: string
}

export interface Finance {
  id: string
  type: 'revenue' | 'expense'
  amount: number
  client_id?: string
  invoice_status?: InvoiceStatus
  is_recurring: boolean
  date: string
  description: string
  client?: Client
}

export interface TeamMember {
  id: string
  clerk_user_id: string
  name: string
  role: TeamRole
  revenue_share: number
  skills: string[]
  active: boolean
}

export interface Deal {
  id: string
  name: string
  company: string
  value: number
  stage: PipelineStage
  probability: number
  contact_email?: string
  notes?: string
  created_at: string
  updated_at: string
}
