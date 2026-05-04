import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'
import { DownloadReportButton } from '@/components/shared/client-report-pdf'
import { Badge } from '@/components/ui/badge'

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = await params

  // Fetch client details
  const { data: client } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  // Fetch related deliverables
  const { data: deliverables } = await supabase
    .from('deliverables')
    .select('*')
    .eq('client_id', id)
    .order('deadline', { ascending: true })

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-muted-foreground">Client introuvable.</p>
        <Button asChild variant="outline">
          <Link href="/os/clients">Retour aux clients</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href="/os/clients"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{client.name}</h1>
              <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="text-[10px] h-4">
                {client.status}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">{client.industry || 'Secteur non spécifié'}</p>
          </div>
        </div>
        
        <DownloadReportButton client={client} deliverables={deliverables || []} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Livrables en cours</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {deliverables && deliverables.length > 0 ? (
              <div className="space-y-3">
                {deliverables.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between p-3 border rounded-lg bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div>
                      <p className="text-sm font-medium">{d.title}</p>
                      <p className="text-xs text-muted-foreground">Deadline: {new Date(d.deadline).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {d.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">Aucun livrable trouvé pour ce client.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Informations Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-muted-foreground font-bold">Email</p>
              <p className="text-sm break-all">{client.email || 'N/A'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase text-muted-foreground font-bold">Valeur Mensuelle</p>
              <p className="text-sm font-medium">{client.monthly_revenue ? `${client.monthly_revenue}€` : 'N/A'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
