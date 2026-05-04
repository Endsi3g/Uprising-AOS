'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/shared/stat-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DollarSign, TrendingUp, TrendingDown, FileText } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from 'recharts'

const REVENUE_DATA = [
  { month: 'Jan', revenue: 0, goal: 8000 },
  { month: 'Fév', revenue: 1200, goal: 8000 },
  { month: 'Mar', revenue: 2500, goal: 8000 },
  { month: 'Avr', revenue: 3800, goal: 8000 },
  { month: 'Mai', revenue: 4200, goal: 8000 },
]

const EXPENSES = [
  { name: 'Brevo', amount: 49, category: 'Marketing' },
  { name: 'Vercel', amount: 20, category: 'Infra' },
  { name: 'Claude API', amount: 35, category: 'IA' },
  { name: 'Apify', amount: 29, category: 'Scraping' },
]

export default function FinancesPage() {
  const totalExpenses = EXPENSES.reduce((a, e) => a + e.amount, 0)
  const currentRevenue = 4200
  const mrrGoal = 8000

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
        <StatCard title="MRR actuel" value={`${currentRevenue.toLocaleString()}$`} icon={DollarSign} trend={{ value: 12, label: 'vs mois dernier' }} />
        <StatCard title="Objectif MRR" value={`${mrrGoal.toLocaleString()}$`} description={`${Math.round(currentRevenue/mrrGoal*100)}% atteint`} icon={TrendingUp} />
        <StatCard title="Dépenses / mois" value={`${totalExpenses}$`} description="Outils & services" icon={TrendingDown} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Revenus vs Objectif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={REVENUE_DATA}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="goal" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.05} strokeDasharray="4 4" name="Objectif" />
                  <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} name="Revenus" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Dépenses outils</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {EXPENSES.map(expense => (
              <div key={expense.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{expense.name}</span>
                  <Badge variant="outline" className="text-[10px]">{expense.category}</Badge>
                </div>
                <span className="text-sm font-medium">{expense.amount}$/mois</span>
              </div>
            ))}
            <div className="pt-2 border-t flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>{totalExpenses}$/mois</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
