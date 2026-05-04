import { createClient } from '@/lib/supabase/server'
import { InvoicesClient } from './invoices-client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function InvoicesPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('finances')
    .select('*, clients(name)')
    .eq('type', 'revenue')
    .order('date', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link href="/os/finances"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Factures</h1>
          <p className="text-muted-foreground text-sm">Suivi et export des factures clients</p>
        </div>
      </div>
      <InvoicesClient invoices={data || []} />
    </div>
  )
}
