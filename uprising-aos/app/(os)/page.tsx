import { StatCard } from '@/components/shared/stat-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  DollarSign,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  Bot,
} from 'lucide-react'

export default function DashboardPage() {
  // Mock data — sera remplacé par Supabase
  const stats = {
    mrr: 4200,
    mrrGoal: 8000,
    activeClients: 5,
    lateDeliverables: 2,
    pipelineValue: 18500,
    tofRatio: 72,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Uprising Agency OS — Vue d'ensemble</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="MRR"
          value={`${stats.mrr.toLocaleString()}$`}
          description={`Objectif: ${stats.mrrGoal.toLocaleString()}$`}
          icon={DollarSign}
          trend={{ value: 12, label: 'vs mois dernier' }}
        />
        <StatCard
          title="Clients actifs"
          value={stats.activeClients}
          description="Pro-bono + payants"
          icon={Users}
        />
        <StatCard
          title="Pipeline total"
          value={`${stats.pipelineValue.toLocaleString()}$`}
          description="Deals en cours"
          icon={TrendingUp}
        />
        <StatCard
          title="Livrables en retard"
          value={stats.lateDeliverables}
          description="Nécessitent attention"
          icon={Package}
          className={stats.lateDeliverables > 0 ? 'border-red-500/50' : ''}
        />
      </div>

      {/* Alerts */}
      {stats.lateDeliverables > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Livrables en retard</AlertTitle>
          <AlertDescription>
            {stats.lateDeliverables} livrable(s) dépassent leur deadline. Vérifiez le module Livrables.
          </AlertDescription>
        </Alert>
      )}

      {stats.tofRatio < 70 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Ratio TOF/MOF dévie</AlertTitle>
          <AlertDescription>
            Ratio actuel : {stats.tofRatio}% TOF. Objectif : 75% TOF / 25% MOF.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* MRR Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Progression MRR</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Réalisé</span>
              <span className="font-medium">{stats.mrr.toLocaleString()}$ / {stats.mrrGoal.toLocaleString()}$</span>
            </div>
            <Progress value={(stats.mrr / stats.mrrGoal) * 100} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {((stats.mrr / stats.mrrGoal) * 100).toFixed(1)}% de l'objectif mensuel
            </p>
          </CardContent>
        </Card>

        {/* Daily Briefing Claude */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">Briefing Claude du jour</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-28">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><Badge variant="outline" className="text-xs mr-1">1</Badge> Relancer les {stats.lateDeliverables} livrables en retard — priorité haute.</p>
                <p><Badge variant="outline" className="text-xs mr-1">2</Badge> Augmenter contenu TOF pour atteindre le ratio 75/25.</p>
                <p><Badge variant="outline" className="text-xs mr-1">3</Badge> Pipeline à {stats.pipelineValue.toLocaleString()}$ — closer les deals en négociation.</p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
