import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/shared/stat-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DollarSign, TrendingUp, TrendingDown, FileText } from 'lucide-react'
import { FinancesCharts } from './charts-client'
import { MRR_GOAL_DEFAULT } from '@/lib/config'

export default async function FinancesPage() {
  const supabase = await createClient()

  // All transactions
  const { data: allFinances } = await supabase
    .from('finances')
    .select('*, clients(name)')
    .order('date', { ascending: false })

  const finances = (allFinances as unknown as any[]) || []

  // Current month MRR
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const monthRevenues = finances.filter(f => f.type === 'revenue' && f.date >= startOfMonth)
  const mrr = monthRevenues.reduce((acc, f) => acc + Number(f.amount), 0)

  const monthExpenses = finances.filter(f => f.type === 'expense' && f.date >= startOfMonth)
  const expenses = monthExpenses.reduce((acc, f) => acc + Number(f.amount), 0)

  const mrrGoal = MRR_GOAL_DEFAULT

  // Build chart data: last 6 months
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const monthStr = d.toISOString().slice(0, 7) // YYYY-MM
    const monthLabel = d.toLocaleDateString('fr-CA', { month: 'short' })

    const revenue = finances
      .filter(f => f.type === 'revenue' && f.date.startsWith(monthStr))
      .reduce((acc, f) => acc + Number(f.amount), 0)

    const exp = finances
      .filter(f => f.type === 'expense' && f.date.startsWith(monthStr))
      .reduce((acc, f) => acc + Number(f.amount), 0)

    return { month: monthLabel, revenue, expenses: exp, goal: mrrGoal }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Finances</h1>
          <p className="text-muted-foreground text-sm">Revenus, dépenses et factures</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/os/finances/invoices"><FileText className="h-4 w-4 mr-1" />Factures</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="MRR actuel"
          value={`${mrr.toLocaleString()}$`}
          description={`Objectif: ${mrrGoal.toLocaleString()}$`}
          icon={DollarSign}
        />
        <StatCard
          title="Progression"
          value={`${Math.round((mrr / mrrGoal) * 100)}%`}
          description={`${mrr.toLocaleString()}$ / ${mrrGoal.toLocaleString()}$ ce mois`}
          icon={TrendingUp}
        />
        <StatCard
          title="Dépenses / mois"
          value={`${expenses.toLocaleString()}$`}
          description="Outils & services"
          icon={TrendingDown}
        />
      </div>

      <FinancesCharts chartData={chartData} finances={finances} />
    </div>
  )
}
