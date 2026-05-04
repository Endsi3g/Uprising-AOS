import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { format } from 'date-fns'
import { DeliverableComments } from './comments-client'
import { currentUser } from '@clerk/nextjs/server'

export default async function DeliverableDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const user = await currentUser()

  const { data: deliverableData } = await supabase
    .from('deliverables')
    .select('*, clients(name)')
    .eq('id', id)
    .single()

  const deliverable = deliverableData as any

  if (!deliverable) {
    notFound()
  }

  const { data: commentsData } = await supabase
    .from('comments')
    .select('*')
    .eq('deliverable_id', id)
    .order('created_at', { ascending: true })

  const initialComments = (commentsData as any[]) || []

  const isLate = deliverable.status !== 'completed' && new Date(deliverable.deadline) < new Date()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{deliverable.title}</h1>
          <p className="text-muted-foreground text-sm">
            Client : {deliverable.clients?.name || 'Inconnu'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isLate && <Badge variant="destructive">En Retard</Badge>}
          <Badge variant="outline">{deliverable.status}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Détails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Assigné à</p>
              <p className="font-medium">{deliverable.assigned_to}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Deadline</p>
              <p className="font-medium">{format(new Date(deliverable.deadline), 'dd MMMM yyyy')}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground mb-1">Progression ({deliverable.progress}%)</p>
              <Progress value={deliverable.progress} className="h-2 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Commentaires</CardTitle>
        </CardHeader>
        <CardContent>
          <DeliverableComments 
            deliverableId={id} 
            initialComments={initialComments || []} 
            currentUserId={user?.id || 'unknown'}
            currentUserName={user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Utilisateur'}
          />
        </CardContent>
      </Card>
    </div>
  )
}
