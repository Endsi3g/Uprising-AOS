'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar, Legend } from 'recharts'

type Finance = {
  id: string
  type: string
  amount: number
  description: string
  date: string
  invoice_status?: string | null
  is_recurring?: boolean
  clients?: { name: string } | null
}

export function FinancesCharts({ chartData, finances }: { chartData: any[], finances: Finance[] }) {
  const recentTransactions = finances.slice(0, 10)

  const INVOICE_COLORS: Record<string, string> = {
    paid: 'bg-green-500/10 text-green-500',
    sent: 'bg-blue-500/10 text-blue-500',
    pending: 'bg-yellow-500/10 text-yellow-500',
  }
  const INVOICE_LABELS: Record<string, string> = {
    paid: 'Payée',
    sent: 'Envoyée',
    pending: 'En attente',
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Revenus vs Objectif (6 mois)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}$`} />
                <Tooltip formatter={(v: any) => `${Number(v).toLocaleString()}$`} />
                <Area type="monotone" dataKey="goal" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.05} strokeDasharray="4 4" name="Objectif" />
                <Area type="monotone" dataKey="revenue" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} name="Revenus" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Revenus vs Dépenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}$`} />
                <Tooltip formatter={(v: any) => `${Number(v).toLocaleString()}$`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" fill="#22c55e" name="Revenus" radius={[3, 3, 0, 0]} />
                <Bar dataKey="expenses" fill="#ef4444" name="Dépenses" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Dernières transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Aucune transaction enregistrée.</p>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map(f => (
                <div key={f.id} className="flex items-center justify-between py-1.5 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-6 rounded-full ${f.type === 'revenue' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="text-sm font-medium">{f.description}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {f.clients?.name ? `${f.clients.name} · ` : ''}{new Date(f.date).toLocaleDateString('fr-CA')}
                        {f.is_recurring && <span className="ml-1 text-blue-500">↻ Récurrent</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {f.invoice_status && (
                      <Badge className={`${INVOICE_COLORS[f.invoice_status]} text-[10px]`}>
                        {INVOICE_LABELS[f.invoice_status]}
                      </Badge>
                    )}
                    <span className={`text-sm font-semibold ${f.type === 'revenue' ? 'text-green-500' : 'text-red-500'}`}>
                      {f.type === 'revenue' ? '+' : '-'}{Number(f.amount).toLocaleString()}$
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
