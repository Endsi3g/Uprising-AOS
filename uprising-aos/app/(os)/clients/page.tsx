import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DataTable } from '@/components/shared/data-table'
import type { ColumnDef } from '@tanstack/react-table'
import type { Client } from '@/types'
import Link from 'next/link'
import { Plus, ArrowUpDown } from 'lucide-react'

const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Tremblay Construction', email: 'info@tremblay.ca', type: 'pro_bono', status: 'active', services: ['Site web', 'SEO'], created_at: '2026-01-15' },
  { id: '2', name: 'Café Lumière', email: 'contact@cafelumiere.ca', type: 'pro_bono', status: 'active', services: ['Instagram', 'Site web'], created_at: '2026-02-01' },
  { id: '3', name: 'PME Solutions', email: 'pme@solutions.ca', type: 'paid', status: 'active', services: ['Stratégie digitale', 'Contenu'], created_at: '2026-03-10' },
]

const columns: ColumnDef<Client>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')} className="h-auto p-0 font-medium text-xs">
        Nom <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="text-[10px]">{row.getValue<string>('name').substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <Link href={`/os/clients/${row.original.id}`} className="font-medium text-sm hover:underline">
          {row.getValue('name')}
        </Link>
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.getValue('email')}</span>,
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({ row }) => (
      <Badge variant={row.getValue('type') === 'paid' ? 'default' : 'secondary'} className="text-xs">
        {row.getValue('type') === 'paid' ? 'Payant' : 'Pro Bono'}
      </Badge>
    ),
  },
  {
    accessorKey: 'services',
    header: 'Services',
    cell: ({ row }) => (
      <div className="flex gap-1 flex-wrap">
        {(row.getValue('services') as string[]).map(s => (
          <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => (
      <Badge className={row.getValue('status') === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}>
        {row.getValue('status') === 'active' ? 'Actif' : 'Archivé'}
      </Badge>
    ),
  },
]

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clients</h1>
          <p className="text-muted-foreground text-sm">Gestion CRM — {MOCK_CLIENTS.length} clients</p>
        </div>
        <Button asChild size="sm">
          <Link href="/os/clients/new"><Plus className="h-4 w-4 mr-1" />Nouveau client</Link>
        </Button>
      </div>
      <DataTable columns={columns} data={MOCK_CLIENTS} searchKey="name" searchPlaceholder="Rechercher un client..." />
    </div>
  )
}
