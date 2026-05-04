export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      workspaces: {
        Row: {
          id: string
          name: string
          slug: string
          owner_id: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['workspaces']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['workspaces']['Insert']>
      }
      workspace_users: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'member'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['workspace_users']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['workspace_users']['Insert']>
      }
      clients: {
        Row: {
          id: string
          workspace_id: string
          name: string
          email: string
          type: 'pro_bono' | 'paid'
          status: 'active' | 'archived'
          services: string[]
          contract_url: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['clients']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['clients']['Insert']>
      }
      deliverables: {
        Row: {
          id: string
          workspace_id: string
          client_id: string
          title: string
          status: 'pending' | 'in_progress' | 'review' | 'completed'
          progress: number
          assigned_to: string
          deadline: string
          is_late: boolean
        }
        Insert: Omit<Database['public']['Tables']['deliverables']['Row'], 'id' | 'is_late'>
        Update: Partial<Database['public']['Tables']['deliverables']['Insert']>
      }
      content_posts: {
        Row: {
          id: string
          workspace_id: string
          title: string
          type: 'TOF' | 'MOF' | 'BOF'
          status: 'idea' | 'script' | 'filming' | 'editing' | 'published'
          script: string | null
          publish_date: string | null
          views: number
          platform: 'instagram' | 'tiktok'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['content_posts']['Row'], 'id' | 'created_at' | 'views'>
        Update: Partial<Database['public']['Tables']['content_posts']['Insert']>
      }
      leads: {
        Row: {
          id: string
          workspace_id: string
          company: string
          city: string
          email: string
          website: string | null
          site_quality: 'outdated' | 'ok' | 'none'
          status: 'cold' | 'email_1' | 'email_2' | 'email_3' | 'replied' | 'call'
          is_premium: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['leads']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
      }
      finances: {
        Row: {
          id: string
          workspace_id: string
          type: 'revenue' | 'expense'
          amount: number
          client_id: string | null
          invoice_status: 'sent' | 'paid' | 'pending' | null
          is_recurring: boolean
          date: string
          description: string
        }
        Insert: Omit<Database['public']['Tables']['finances']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['finances']['Insert']>
      }
      team_members: {
        Row: {
          id: string
          workspace_id: string
          clerk_user_id: string
          name: string
          role: 'founder' | 'ops' | 'sales'
          revenue_share: number
          skills: string[]
          active: boolean
        }
        Insert: Omit<Database['public']['Tables']['team_members']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['team_members']['Insert']>
      }
      deals: {
        Row: {
          id: string
          workspace_id: string
          name: string
          company: string
          value: number
          stage: 'prospect' | 'discovery' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost' | 'on_hold'
          probability: number
          contact_email: string | null
          contact_phone: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['deals']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['deals']['Insert']>
      }
      team_checkins: {
        Row: {
          id: string
          team_member_id: string
          content: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['team_checkins']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['team_checkins']['Insert']>
      }
      comments: {
        Row: {
          id: string
          deliverable_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['comments']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['comments']['Insert']>
      }
    }
  }
}
