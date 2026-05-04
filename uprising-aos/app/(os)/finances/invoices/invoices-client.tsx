'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

type Invoice = {
  id: string
  amount: number
  description: string
  date: string
  invoice_status?: string | null
  is_recurring?: boolean
  clients?: { name: string } | null
}

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-500/10 text-green-500',
  sent: 'bg-blue-500/10 text-blue-500',
  pending: 'bg-yellow-500/10 text-yellow-500',
}

const STATUS_LABELS: Record<string, string> = {
  paid: 'Payée',
  sent: 'Envoyée',
  pending: 'En attente',
}

export function InvoicesClient({ invoices }: { invoices: Invoice[] }) {
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.invoice_status === filter)

  const totalPaid = invoices.filter(i => i.invoice_status === 'paid').reduce((acc, i) => acc + Number(i.amount), 0)
  const totalPending = invoices.filter(i => i.invoice_status === 'pending').reduce((acc, i) => acc + Number(i.amount), 0)

  const handleExportCSV = () => {
    const headers = ['Date', 'Description', 'Client', 'Montant', 'Statut', 'Récurrent']
    const rows = filtered.map(i => [
      i.date,
      i.description,
      i.clients?.name || '',
      i.amount,
      i.invoice_status || '',
      i.is_recurring ? 'Oui' : 'Non',
    ])

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `factures-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Export CSV téléchargé')
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">Facturé & Payé</p>
          <p className="text-2xl font-bold text-green-500">{totalPaid.toLocaleString()}$</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-xs text-muted-foreground">En attente de paiement</p>
          <p className="text-2xl font-bold text-yellow-500">{totalPending.toLocaleString()}$</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <Select value={filter} onValueChange={(val) => setFilter(val || 'all')}>
          <SelectTrigger className="w-40 h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="paid">Payées</SelectItem>
            <SelectItem value="sent">Envoyées</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" variant="outline" onClick={handleExportCSV} className="gap-1.5">
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Date</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Description</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Client</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground">Montant</th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground">Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-muted-foreground text-sm">Aucune facture trouvée.</td>
              </tr>
            ) : (
              filtered.map(invoice => (
                <tr key={invoice.id} className="border-t hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(invoice.date).toLocaleDateString('fr-CA')}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{invoice.description}</span>
                    {invoice.is_recurring && <span className="ml-2 text-[10px] text-blue-500">↻</span>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{invoice.clients?.name || '—'}</td>
                  <td className="px-4 py-3 text-right font-semibold">{Number(invoice.amount).toLocaleString()}$</td>
                  <td className="px-4 py-3 text-center">
                    {invoice.invoice_status ? (
                      <Badge className={`${STATUS_COLORS[invoice.invoice_status]} text-[10px]`}>
                        {STATUS_LABELS[invoice.invoice_status]}
                      </Badge>
                    ) : <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
