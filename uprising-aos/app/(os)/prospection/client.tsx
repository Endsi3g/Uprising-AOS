'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { Lead } from '@/types'
import Link from 'next/link'
import { Plus, ArrowUpDown, Mail, Upload } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const STATUS_LABELS: Record<string, string> = {
  cold: 'Non contacté', email_1: 'Email 1', email_2: 'Email 2',
  email_3: 'Email 3', replied: 'Répondu', call: 'Call',
}
const STATUS_COLORS: Record<string, string> = {
  cold: 'bg-gray-500/10 text-gray-500',
  email_1: 'bg-blue-500/10 text-blue-500',
  email_2: 'bg-blue-500/10 text-blue-500',
  email_3: 'bg-yellow-500/10 text-yellow-500',
  replied: 'bg-green-500/10 text-green-500',
  call: 'bg-purple-500/10 text-purple-500',
}
const SITE_QUALITY_LABELS: Record<string, string> = { outdated: 'Désuet', ok: 'OK', none: 'Absent' }

export function ProspectionClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [isImporting, setIsImporting] = useState(false)

  const handleCSVImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsImporting(true)

    const text = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = ev => resolve(ev.target?.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })

    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))

    const normalize = (row: string[]): Partial<Lead> | null => {
      const get = (keys: string[]) => {
        for (const k of keys) {
          const idx = headers.findIndex(h => h.includes(k))
          if (idx !== -1) return row[idx]?.trim().replace(/"/g, '') || ''
        }
        return ''
      }

      const company = get(['company', 'entreprise', 'nom'])
      const email = get(['email', 'courriel', 'mail'])
      const city = get(['city', 'ville', 'city'])

      if (!company || !email) return null

      return {
        company,
        email,
        city: city || 'N/A',
        site_quality: 'ok',
        status: 'cold',
        is_premium: false,
      }
    }

    const toInsert = lines.slice(1)
      .map(line => normalize(line.split(',')))
      .filter(Boolean) as Partial<Lead>[]

    if (toInsert.length === 0) {
      toast.error('Aucun lead valide trouvé dans le CSV')
      setIsImporting(false)
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase.from('leads').insert(toInsert as any).select()

    if (error) {
      toast.error(`Erreur d'import: ${error.message}`)
    } else {
      setLeads(prev => [...(data as Lead[]), ...prev])
      toast.success(`${data.length} leads importés avec succès`)
    }
    setIsImporting(false)
    e.target.value = ''
  }, [])

  const columns: ColumnDef<Lead>[] = [
    {
      accessorKey: 'company',
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting()} className="h-auto p-0 font-medium text-xs">
          Entreprise <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-sm">{row.getValue('company')}</p>
          <p className="text-[10px] text-muted-foreground">{row.original.city}</p>
        </div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.getValue('email')}</span>,
    },
    {
      accessorKey: 'site_quality',
      header: 'Site',
      cell: ({ row }) => <span className="text-xs">{SITE_QUALITY_LABELS[row.getValue('site_quality') as string]}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => (
        <Badge className={`${STATUS_COLORS[row.getValue('status') as string]} text-[10px]`}>
          {STATUS_LABELS[row.getValue('status') as string]}
        </Badge>
      ),
    },
    {
      accessorKey: 'is_premium',
      header: 'Premium',
      cell: ({ row }) => row.getValue('is_premium') ? <Badge className="text-[10px]">Premium</Badge> : null,
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button asChild variant="outline" size="sm" className="h-7 text-xs gap-1">
          <Link href={`/os/prospection/email-gen?company=${row.original.company}&email=${row.original.email}`}>
            <Mail className="h-3 w-3" />Email
          </Link>
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prospection</h1>
          <p className="text-muted-foreground text-sm">{leads.length} leads · Campagnes Brevo</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/os/prospection/campaigns">Campagnes</Link>
          </Button>
          {/* CSV Import */}
          <label>
            <input type="file" accept=".csv" className="hidden" onChange={handleCSVImport} disabled={isImporting} />
            <Button asChild variant="outline" size="sm" className="gap-1.5 cursor-pointer" disabled={isImporting}>
              <span><Upload className="h-3.5 w-3.5" />{isImporting ? 'Import...' : 'CSV'}</span>
            </Button>
          </label>
          <Button asChild size="sm">
            <Link href="/os/prospection/email-gen"><Plus className="h-4 w-4 mr-1" />Générer email</Link>
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={leads} searchKey="company" searchPlaceholder="Rechercher un lead..." />
    </div>
  )
}
