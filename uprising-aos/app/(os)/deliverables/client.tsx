'use client'

import React, { useEffect, useState } from 'react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { toggleDeliverableStatus } from './actions'
import { toast } from 'sonner'
import { format, differenceInHours } from 'date-fns'

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

type ClientData = { id: string, name: string }
type DeliverableData = {
  id: string
  title: string
  status: string
  progress: number
  assigned_to: string
  deadline: string
  is_late: boolean
  client_id: string
}

export function DeliverableClient({ 
  deliverables, 
  clients 
}: { 
  deliverables: DeliverableData[], 
  clients: ClientData[] 
}) {
  const [localDeliverables, setLocalDeliverables] = useState(deliverables)

  useEffect(() => {
    setLocalDeliverables(deliverables)
  }, [deliverables])

  // Request Notification permission and check deadlines
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          const urgentDeliverables = deliverables.filter(d => {
            if (d.status === 'completed') return false
            const hours = differenceInHours(new Date(d.deadline), new Date())
            return hours > 0 && hours <= 48
          })

          urgentDeliverables.forEach(d => {
            // We use sessionStorage to prevent spamming notifications on every mount
            const notifiedKey = `notified_${d.id}`
            if (!sessionStorage.getItem(notifiedKey)) {
              new Notification('Deadline Approchante !', {
                body: `Le livrable "${d.title}" est dû dans moins de 48h.`,
                icon: '/favicon.ico' // Assuming standard favicon
              })
              sessionStorage.setItem(notifiedKey, 'true')
            }
          })
        }
      })
    }
  }, [deliverables])

  const lateCount = localDeliverables.filter(d => d.is_late).length
  const clientIds = [...new Set(localDeliverables.map(d => d.client_id))]

  const handleToggle = async (id: string, currentStatus: string) => {
    const isCompleted = currentStatus !== 'completed'
    
    // Optimistic UI update
    setLocalDeliverables(prev => prev.map(d => 
      d.id === id 
        ? { ...d, status: isCompleted ? 'completed' : 'in_progress', progress: isCompleted ? 100 : 50, is_late: false } 
        : d
    ))

    const res = await toggleDeliverableStatus(id, isCompleted)
    if (!res.success) {
      toast.error('Erreur lors de la mise à jour')
      // Revert on error
      setLocalDeliverables(deliverables)
    } else {
      toast.success(isCompleted ? 'Livrable complété' : 'Livrable remis en cours')
    }
  }

  return (
    <div className="space-y-6">
      {lateCount > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{lateCount} livrable(s) en retard</AlertTitle>
          <AlertDescription>Des livrables dépassent leur deadline — action requise.</AlertDescription>
        </Alert>
      )}

      <Accordion multiple defaultValue={clientIds} className="space-y-2">
        {clientIds.map(clientId => {
          const clientData = clients.find(c => c.id === clientId)
          const clientName = clientData ? clientData.name : 'Client Inconnu'
          const clientDeliverables = localDeliverables.filter(d => d.client_id === clientId)
          const completed = clientDeliverables.filter(d => d.status === 'completed').length
          const progress = clientDeliverables.length > 0 ? Math.round((completed / clientDeliverables.length) * 100) : 0

          return (
            <AccordionItem key={clientId} value={clientId} className="border rounded-lg px-4">
              <AccordionTrigger className="py-3">
                <div className="flex items-center gap-3 flex-1 mr-4">
                  <span className="font-semibold text-sm">{clientName}</span>
                  <Badge variant="outline" className="text-xs">{completed}/{clientDeliverables.length}</Badge>
                  <Progress value={progress} className="h-1.5 flex-1 max-w-24" />
                  <span className="text-xs text-muted-foreground">{progress}%</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pb-2">
                  {clientDeliverables.map(deliverable => (
                    <div key={deliverable.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50">
                      <Checkbox 
                        checked={deliverable.status === 'completed'} 
                        onCheckedChange={() => handleToggle(deliverable.id, deliverable.status)}
                        className="mt-0.5" 
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Link href={`/os/deliverables/${deliverable.id}`} className="text-sm font-medium hover:underline">
                            {deliverable.title}
                          </Link>
                          {deliverable.is_late && (
                            <Badge variant="destructive" className="text-[10px] h-4">Retard</Badge>
                          )}
                          <Badge className={`${STATUS_COLORS[deliverable.status]} text-[10px] h-4`}>
                            {STATUS_LABELS[deliverable.status] || deliverable.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Assigné: {deliverable.assigned_to}</span>
                          <span>·</span>
                          <span>Deadline: {format(new Date(deliverable.deadline), 'dd/MM/yyyy')}</span>
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
