import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import type { Deliverable } from '@/types'

const MOCK_DELIVERABLES: Deliverable[] = [
  { id: '1', client_id: '1', title: 'Redesign homepage', status: 'in_progress', progress: 65, assigned_to: 'Kael', deadline: '2026-05-08', is_late: true },
  { id: '2', client_id: '1', title: 'Optimisation SEO on-page', status: 'pending', progress: 0, assigned_to: 'Xavier', deadline: '2026-05-20', is_late: false },
  { id: '3', client_id: '2', title: 'Stratégie Instagram mai', status: 'completed', progress: 100, assigned_to: 'Kael', deadline: '2026-05-01', is_late: false },
  { id: '4', client_id: '2', title: 'Photos produits', status: 'in_progress', progress: 40, assigned_to: 'Xavier', deadline: '2026-05-06', is_late: true },
]

const CLIENTS: Record<string, string> = {
  '1': 'Tremblay Construction',
  '2': 'Café Lumière',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-500/10 text-gray-500',
  in_progress: 'bg-blue-500/10 text-blue-500',
  review: 'bg-yellow-500/10 text-yellow-500',
  completed: 'bg-green-500/10 text-green-500',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  in_progress: 'En cours',
  review: 'Révision',
  completed: 'Complété',
}

export default function DeliverablesPage() {
  const lateCount = MOCK_DELIVERABLES.filter(d => d.is_late).length
  const clientIds = [...new Set(MOCK_DELIVERABLES.map(d => d.client_id))]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Livrables</h1>
        <p className="text-muted-foreground text-sm">Suivi des livrables par client</p>
      </div>

      {lateCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{lateCount} livrable(s) en retard</AlertTitle>
          <AlertDescription>Des livrables dépassent leur deadline — action requise.</AlertDescription>
        </Alert>
      )}

      <Accordion multiple defaultValue={clientIds} className="space-y-2">
        {clientIds.map(clientId => {
          const clientDeliverables = MOCK_DELIVERABLES.filter(d => d.client_id === clientId)
          const completed = clientDeliverables.filter(d => d.status === 'completed').length
          const progress = Math.round((completed / clientDeliverables.length) * 100)

          return (
            <AccordionItem key={clientId} value={clientId} className="border rounded-lg px-4">
              <AccordionTrigger className="py-3">
                <div className="flex items-center gap-3 flex-1 mr-4">
                  <span className="font-semibold text-sm">{CLIENTS[clientId]}</span>
                  <Badge variant="outline" className="text-xs">{completed}/{clientDeliverables.length}</Badge>
                  <Progress value={progress} className="h-1.5 flex-1 max-w-24" />
                  <span className="text-xs text-muted-foreground">{progress}%</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pb-2">
                  {clientDeliverables.map(deliverable => (
                    <div key={deliverable.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50">
                      <Checkbox checked={deliverable.status === 'completed'} className="mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{deliverable.title}</span>
                          {deliverable.is_late && (
                            <Badge variant="destructive" className="text-[10px] h-4">Retard</Badge>
                          )}
                          <Badge className={`${STATUS_COLORS[deliverable.status]} text-[10px] h-4`}>
                            {STATUS_LABELS[deliverable.status]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Assigné: {deliverable.assigned_to}</span>
                          <span>·</span>
                          <span>Deadline: {deliverable.deadline}</span>
                          <span>·</span>
                          <span>{deliverable.progress}%</span>
                        </div>
                        {deliverable.progress > 0 && deliverable.progress < 100 && (
                          <Progress value={deliverable.progress} className="h-1 w-32" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}
