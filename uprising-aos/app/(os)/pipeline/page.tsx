import { TooltipProvider } from '@/components/ui/tooltip'
import { DollarSign, Plus } from 'lucide-react'
import { PipelineKanban } from '@/components/shared/pipeline-kanban'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import type { Deal } from '@/types'

export default async function PipelinePage() {
  const supabase = await createClient()

  const { data: dealsData } = await supabase
    .from('deals')
    .select('*')
    .order('updated_at', { ascending: false })

  const deals = (dealsData as unknown as Deal[]) || []

  const totalPipeline = deals.reduce((acc, d) => acc + d.value, 0)
  const weightedPipeline = deals.reduce((acc, d) => acc + (d.value * d.probability / 100), 0)

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Pipeline</h1>
            <p className="text-muted-foreground text-sm">Kanban deals de vente</p>
          </div>
          <div className="flex items-center gap-6">
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
            {/* The "Nouveau Deal" button functionality is handled inside the PipelineKanban by opening a sheet */}
            {/* We can trigger an empty deal creation by passing a special prop, but for simplicity, we let users use a floating button or handle it via context. We'll leave it simple here. */}
          </div>
        </div>

        {/* Kanban */}
        <PipelineKanban initialDeals={deals as any} />
      </div>
    </TooltipProvider>
  )
}
