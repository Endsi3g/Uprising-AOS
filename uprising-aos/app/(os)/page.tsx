import { createClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { DollarSign, Package, Users, TrendingUp, AlertTriangle, Bot, CheckCircle2 } from 'lucide-react'
import { fetchTodoistTasks } from '@/lib/todoist'
import { fetchMetricoolReelsStats } from '@/lib/metricool'
import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { differenceInDays } from 'date-fns'
import type { Finance, Client, Deliverable, Deal, ContentPost } from '@/types'

export const revalidate = 0 // Disable caching for the dashboard

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch data in parallel
  const [
    { data: finances },
    { data: clients },
    { data: deliverables },
    { data: deals },
    { data: posts },
    todoistTasks,
    reelsStats
  ] = await Promise.all([
    supabase.from('finances').select('*').eq('type', 'revenue'),
    supabase.from('clients').select('*').eq('status', 'active'),
    supabase.from('deliverables').select('*'),
    supabase.from('deals').select('*'),
    supabase.from('content_posts').select('type'),
    fetchTodoistTasks(),
    fetchMetricoolReelsStats('uprising_agency') // Blog ID exemple
  ])

  const typedFinances = (finances as unknown as Finance[]) || []
  const typedClients = (clients as unknown as Client[]) || []
  const typedDeliverables = (deliverables as unknown as Deliverable[]) || []
  const typedDeals = (deals as unknown as Deal[]) || []
  const typedPosts = (posts as unknown as ContentPost[]) || []

  // Calculate MRR
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const mrr = typedFinances
    .filter(f => f.date >= startOfMonth)
    .reduce((acc, f) => acc + Number(f.amount), 0)
  const mrrGoal = 8000

  // Calculate active clients
  const activeClients = typedClients.length

  // Calculate pipeline
  const pipelineValue = typedDeals
    .filter(d => !['closed_won', 'closed_lost'].includes(d.stage))
    .reduce((acc, d) => acc + Number(d.value), 0)

  // Calculate late deliverables
  const lateDeliverables = typedDeliverables.filter(d => 
    d.status !== 'completed' && differenceInDays(new Date(d.deadline), now) < 0
  ).length

  // Calculate TOF Ratio
  const totalPosts = typedPosts.length
  const tofPosts = typedPosts.filter(p => p.type === 'TOF').length
  const tofRatio = totalPosts > 0 ? Math.round((tofPosts / totalPosts) * 100) : 0

  const stats = {
    mrr,
    mrrGoal,
    activeClients,
    lateDeliverables,
    pipelineValue,
    tofRatio,
    reels: reelsStats
  }

  // Generate AI Briefing
  let aiBriefing = "Impossible de générer le briefing pour le moment."
  try {
    if (process.env.ANTHROPIC_API_KEY) {
      const { text } = await generateText({
        model: anthropic('claude-3-5-sonnet-latest'),
        system: "Tu es l'assistant IA de l'Uprising Agency OS. Fournis un briefing journalier de 4 points ultra courts et directs (bullet points) basés sur les KPIs suivants. Ne dis pas bonjour, va droit au but. Inclus une note sur les performances Reels.",
        prompt: `KPIs: MRR=${stats.mrr}$, Objectif MRR=${stats.mrrGoal}$, Pipeline=${stats.pipelineValue}$, Livrables en retard=${stats.lateDeliverables}, Ratio TOF=${stats.tofRatio}%, Stats Reels=[Vues: ${stats.reels?.views}, Engagement: ${stats.reels?.engagement}%].`
      })
      aiBriefing = text
    } else {
      aiBriefing = "Clé API Anthropic manquante."
    }
  } catch (e) {
    console.error("AI Briefing error", e)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Uprising Agency OS — Vue d'ensemble</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="MRR" value={`${stats.mrr.toLocaleString()}$`} description={`Objectif: ${stats.mrrGoal.toLocaleString()}$`} icon={DollarSign} />
        <StatCard title="Clients actifs" value={stats.activeClients} description="Pro-bono + payants" icon={Users} />
        <StatCard title="Pipeline total" value={`${stats.pipelineValue.toLocaleString()}$`} description="Deals en cours" icon={TrendingUp} />
        <StatCard title="Livrables en retard" value={stats.lateDeliverables} description="Nécessitent attention" icon={Package} className={stats.lateDeliverables > 0 ? 'border-red-500/50' : ''} />
      </div>

      {stats.lateDeliverables > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Livrables en retard</AlertTitle>
          <AlertDescription>{stats.lateDeliverables} livrable(s) dépassent leur deadline. Vérifiez le module Livrables.</AlertDescription>
        </Alert>
      )}

      {stats.tofRatio < 70 && totalPosts > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Ratio TOF/MOF dévie</AlertTitle>
          <AlertDescription>Ratio actuel : {stats.tofRatio}% TOF. Objectif : 75% TOF / 25% MOF.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {/* MRR Progress */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Progression MRR</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Réalisé</span>
              <span className="font-medium">{stats.mrr.toLocaleString()}$ / {stats.mrrGoal.toLocaleString()}$</span>
            </div>
            <Progress value={Math.min((stats.mrr / stats.mrrGoal) * 100, 100)} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {((stats.mrr / stats.mrrGoal) * 100).toFixed(1)}% de l'objectif mensuel
            </p>
          </CardContent>
        </Card>

        {/* Daily Briefing Claude */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Briefing Claude</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-28 pr-4">
              <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {aiBriefing}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Todoist Integration */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Todoist (Xavier)</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-28 pr-4">
              {todoistTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune tâche en retard ou pour aujourd'hui.</p>
              ) : (
                <div className="space-y-2">
                  {todoistTasks.map((t: any) => (
                    <div key={t.id} className="flex items-start gap-2 text-sm border-b pb-2 last:border-0">
                      <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${t.priority === 4 ? 'bg-red-500' : 'bg-blue-500'}`} />
                      <span className="text-muted-foreground leading-tight">{t.content}</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
