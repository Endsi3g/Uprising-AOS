'use client'

import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { updateDealStage } from '@/app/(os)/pipeline/actions'
import { DealSheet } from './deal-sheet'
import { toast } from 'sonner'
import type { Deal, PipelineStage } from '@/types'
import { differenceInDays } from 'date-fns'
import { AlertTriangle } from 'lucide-react'

const PIPELINE_STAGES = [
  { key: 'prospect', label: 'Prospect', color: 'text-muted-foreground' },
  { key: 'discovery', label: 'Discovery', color: 'text-blue-500' },
  { key: 'proposal', label: 'Proposition', color: 'text-yellow-500' },
  { key: 'negotiation', label: 'Négociation', color: 'text-orange-500' },
  { key: 'closed_won', label: 'Gagné', color: 'text-green-500' },
  { key: 'closed_lost', label: 'Perdu', color: 'text-red-500' },
  { key: 'on_hold', label: 'En attente', color: 'text-purple-500' },
]

export function PipelineKanban({ initialDeals }: { initialDeals: Deal[] }) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    setDeals(initialDeals)
  }, [initialDeals])

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result

    if (!destination) return

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return
    }

    const newStage = destination.droppableId as PipelineStage

    // Optimistic UI update
    const previousDeals = [...deals]
    setDeals(deals.map(d => d.id === draggableId ? { ...d, stage: newStage, updated_at: new Date().toISOString() } : d))

    // Update in backend
    try {
      const res = await updateDealStage(draggableId, newStage)
      if (!res.success) throw new Error(res.error)
      toast.success('Étape du deal mise à jour')
    } catch (error) {
      setDeals(previousDeals)
      toast.error('Erreur lors de la mise à jour du deal')
    }
  }

  const openDealSheet = (deal: Deal) => {
    setSelectedDeal(deal)
    setIsSheetOpen(true)
  }

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {PIPELINE_STAGES.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage.key)
            const stageTotal = stageDeals.reduce((acc, d) => acc + d.value, 0)

            return (
              <div key={stage.key} className="space-y-2">
                <div className="text-center mb-2">
                  <p className={`text-xs font-medium ${stage.color}`}>{stage.label}</p>
                  {stageTotal > 0 && <p className="text-[10px] text-muted-foreground">{stageTotal.toLocaleString()}$</p>}
                </div>

                <Droppable droppableId={stage.key}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`min-h-[500px] space-y-2 rounded-md transition-colors ${
                        snapshot.isDraggingOver ? 'bg-muted/50' : ''
                      }`}
                    >
                      {stageDeals.map((deal, index) => {
                        const isStalled = differenceInDays(new Date(), new Date(deal.updated_at)) > 7
                        
                        return (
                          <Draggable key={deal.id} draggableId={deal.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{
                                  ...provided.draggableProps.style,
                                  opacity: snapshot.isDragging ? 0.8 : 1,
                                }}
                                onClick={() => openDealSheet(deal)}
                              >
                                <HoverCard>
                                  <HoverCardTrigger>
                                    <Card className={`cursor-pointer hover:border-primary/50 transition-colors ${isStalled ? 'border-orange-500/50' : ''}`}>
                                      <CardContent className="p-2.5 space-y-1.5">
                                        <div className="flex justify-between items-start">
                                          <p className="text-xs font-medium leading-tight">{deal.name}</p>
                                          {isStalled && <AlertTriangle className="w-3 h-3 text-orange-500" />}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground truncate">{deal.company}</p>
                                        <div className="flex items-center justify-between">
                                          <Badge variant="outline" className="text-[10px] h-4">{deal.value.toLocaleString()}$</Badge>
                                          <span className="text-[10px] text-muted-foreground">{deal.probability}%</span>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-56 z-50">
                                    <div className="space-y-2">
                                      <p className="font-semibold text-sm">{deal.name}</p>
                                      <p className="text-xs text-muted-foreground">{deal.company}</p>
                                      {isStalled && (
                                        <p className="text-[10px] text-orange-500 font-medium">⚠️ Pas de mouvement depuis &gt; 7 jours</p>
                                      )}
                                      <div className="text-xs space-y-1 pt-2">
                                        <div className="flex justify-between"><span>Valeur:</span><span className="font-medium">{deal.value.toLocaleString()}$</span></div>
                                        <div className="flex justify-between"><span>Probabilité:</span><span className="font-medium">{deal.probability}%</span></div>
                                        <div className="flex justify-between"><span>Pondéré:</span><span className="font-medium">{Math.round(deal.value * deal.probability / 100).toLocaleString()}$</span></div>
                                      </div>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {isSheetOpen && (
        <DealSheet 
          open={isSheetOpen} 
          onOpenChange={setIsSheetOpen} 
          deal={selectedDeal} 
        />
      )}
    </>
  )
}
