import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { Deal } from '@/types'
import { DollarSign } from 'lucide-react'

const PIPELINE_STAGES: { key: string; label: string; color: string }[] = [
  { key: 'prospect', label: 'Prospect', color: 'text-muted-foreground' },
  { key: 'discovery', label: 'Discovery', color: 'text-blue-500' },
  { key: 'proposal', label: 'Proposition', color: 'text-yellow-500' },
  { key: 'negotiation', label: 'Négociation', color: 'text-orange-500' },
  { key: 'closed_won', label: 'Gagné', color: 'text-green-500' },
  { key: 'closed_lost', label: 'Perdu', color: 'text-red-500' },
  { key: 'on_hold', label: 'En attente', color: 'text-purple-500' },
]

const MOCK_DEALS: Deal[] = [
  { id: '1', name: 'Site web + SEO', company: 'Garage Martin', value: 3500, stage: 'proposal', probability: 70, created_at: '2026-04-01', updated_at: '2026-04-28' },
  { id: '2', name: 'Stratégie Instagram', company: 'Boulangerie Dubois', value: 1800, stage: 'discovery', probability: 40, created_at: '2026-04-15', updated_at: '2026-05-01' },
  { id: '3', name: 'Refonte complète', company: 'Clinique Beaumont', value: 8500, stage: 'negotiation', probability: 80, created_at: '2026-03-20', updated_at: '2026-04-30' },
  { id: '4', name: 'Landing page', company: 'Coach Fitness Pro', value: 1200, stage: 'prospect', probability: 20, created_at: '2026-05-01', updated_at: '2026-05-01' },
]

export default function PipelinePage() {
  const totalPipeline = MOCK_DEALS.reduce((acc, d) => acc + d.value, 0)
  const weightedPipeline = MOCK_DEALS.reduce((acc, d) => acc + (d.value * d.probability / 100), 0)

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pipeline</h1>
            <p className="text-muted-foreground text-sm">Kanban deals de vente</p>
          </div>
          <div className="flex gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="font-bold">{totalPipeline.toLocaleString()}$</span>
              <span className="text-muted-foreground">pipeline total</span>
            </div>
            <div className="text-muted-foreground">·</div>
            <div>
              <span className="font-bold text-green-500">{Math.round(weightedPipeline).toLocaleString()}$</span>
              <span className="text-muted-foreground ml-1">pondéré</span>
            </div>
          </div>
        </div>

        {/* Kanban */}
        <div className="grid grid-cols-7 gap-2">
          {PIPELINE_STAGES.map(stage => {
            const deals = MOCK_DEALS.filter(d => d.stage === stage.key)
            const stageTotal = deals.reduce((acc, d) => acc + d.value, 0)
            return (
              <div key={stage.key} className="space-y-2">
                <div className="text-center">
                  <p className={`text-xs font-medium ${stage.color}`}>{stage.label}</p>
                  {stageTotal > 0 && <p className="text-[10px] text-muted-foreground">{stageTotal.toLocaleString()}$</p>}
                </div>
                <div className="space-y-2 min-h-20">
                  {deals.map(deal => (
                    <HoverCard key={deal.id}>
                      <HoverCardTrigger>
                        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                          <CardContent className="p-2.5 space-y-1.5">
                            <p className="text-xs font-medium leading-tight">{deal.name}</p>
                            <p className="text-[10px] text-muted-foreground">{deal.company}</p>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-[10px] h-4">{deal.value.toLocaleString()}$</Badge>
                              <span className="text-[10px] text-muted-foreground">{deal.probability}%</span>
                            </div>
                          </CardContent>
                        </Card>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-56">
                        <div className="space-y-2">
                          <p className="font-semibold text-sm">{deal.name}</p>
                          <p className="text-xs text-muted-foreground">{deal.company}</p>
                          <div className="text-xs space-y-1">
                            <div className="flex justify-between"><span>Valeur:</span><span className="font-medium">{deal.value.toLocaleString()}$</span></div>
                            <div className="flex justify-between"><span>Probabilité:</span><span className="font-medium">{deal.probability}%</span></div>
                            <div className="flex justify-between"><span>Pondéré:</span><span className="font-medium">{Math.round(deal.value * deal.probability / 100).toLocaleString()}$</span></div>
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}
