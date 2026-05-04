import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/shared/data-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { Lead } from '@/types'
import Link from 'next/link'
import { Plus, ArrowUpDown, Mail } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  cold: 'Non contacté',
  email_1: 'Email 1',
  email_2: 'Email 2',
  email_3: 'Email 3',
  replied: 'Répondu',
  call: 'Call',
}

const STATUS_COLORS: Record<string, string> = {
  cold: 'bg-gray-500/10 text-gray-500',
  email_1: 'bg-blue-500/10 text-blue-500',
  email_2: 'bg-blue-500/10 text-blue-500',
  email_3: 'bg-yellow-500/10 text-yellow-500',
  replied: 'bg-green-500/10 text-green-500',
  call: 'bg-purple-500/10 text-purple-500',
}

const SITE_QUALITY_LABELS: Record<string, string> = {
  outdated: 'Désuet',
  ok: 'OK',
  none: 'Absent',
}

const MOCK_LEADS: Lead[] = [
  { id: '1', company: 'Garage Deschamps', city: 'Montréal', email: 'garage@deschamps.ca', website: 'deschamps.ca', site_quality: 'outdated', status: 'cold', is_premium: false, created_at: '2026-04-20' },
  { id: '2', company: 'Resto La Belle Province', city: 'Québec', email: 'info@belleprovince.ca', site_quality: 'none', status: 'email_1', is_premium: true, created_at: '2026-04-22' },
  { id: '3', company: 'Plomberie Côté', city: 'Laval', email: 'cote@plomberie.ca', website: 'coteplomberie.ca', site_quality: 'outdated', status: 'replied', is_premium: false, created_at: '2026-04-18' },
]

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

export default function ProspectionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Prospection</h1>
          <p className="text-muted-foreground text-sm">{MOCK_LEADS.length} leads · Campagnes Brevo</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/os/prospection/campaigns">Campagnes</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/os/prospection/email-gen"><Plus className="h-4 w-4 mr-1" />Générer email</Link>
          </Button>
        </div>
      </div>
      <DataTable columns={columns} data={MOCK_LEADS} searchKey="company" searchPlaceholder="Rechercher un lead..." />
    </div>
  )
}
