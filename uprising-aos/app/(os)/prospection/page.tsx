import { createClient } from '@/lib/supabase/server'
import { ProspectionClient } from './client'

export default async function ProspectionPage() {
  const supabase = await createClient()

  const { data: leadsData } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  const leads = leadsData || []

  return <ProspectionClient initialLeads={leads} />
}
