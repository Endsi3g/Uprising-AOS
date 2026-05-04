import { createClient } from '@/lib/supabase/server'
import { DeliverableClient } from './client'
import { differenceInDays } from 'date-fns'
import type { Deliverable, Client } from '@/types'

export default async function DeliverablesPage() {
  const supabase = await createClient()

  // Fetch clients to map IDs to names
  const { data: clientsData } = await supabase.from('clients').select('id, name')
  const clients = (clientsData as unknown as Pick<Client, 'id' | 'name'>[]) || []

  // Fetch deliverables
  const { data: deliverablesData } = await supabase
    .from('deliverables')
    .select('*')
    .order('deadline', { ascending: true })

  let deliverables = (deliverablesData as unknown as Deliverable[]) || []

  // Calculate is_late dynamically
  deliverables = deliverables.map(d => {
    const isLate = d.status !== 'completed' && differenceInDays(new Date(d.deadline), new Date()) < 0
    return { ...d, is_late: isLate }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Livrables</h1>
        <p className="text-muted-foreground text-sm">Suivi des livrables par client</p>
      </div>

      <DeliverableClient deliverables={deliverables} clients={clients} />
    </div>
  )
}
