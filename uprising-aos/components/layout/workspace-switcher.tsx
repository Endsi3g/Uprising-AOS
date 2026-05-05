'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronsUpDown, PlusCircle, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
// Button is used in Dialog footer
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function WorkspaceSwitcher() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchWorkspaces() {
      const { data } = await (supabase as any).from('workspaces').select('*')
      if (data && data.length > 0) {
        setWorkspaces(data)
        const saved = localStorage.getItem('active_workspace_id')
        const found = data.find((w: any) => w.id === saved) || data[0]
        setActiveWorkspace(found)
        if (!saved) localStorage.setItem('active_workspace_id', found.id)
      }
    }
    fetchWorkspaces()
  }, [supabase])

  const onWorkspaceSelect = (workspace: any) => {
    setActiveWorkspace(workspace)
    setOpen(false)
    localStorage.setItem('active_workspace_id', workspace.id)
    router.refresh()
  }

  async function handleCreateWorkspace() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await (supabase as any)
        .from('workspaces')
        .insert({ name: newName.trim(), owner_id: user?.id })
        .select()
        .single()

      if (error) throw error

      setWorkspaces(prev => [...prev, data])
      setActiveWorkspace(data)
      localStorage.setItem('active_workspace_id', data.id)
      setCreateOpen(false)
      setNewName('')
      router.refresh()
      toast.success(`Agence "${data.name}" créée`)
    } catch {
      toast.error('Erreur lors de la création de l\'agence')
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          role="combobox"
          aria-expanded={open}
          aria-label="Sélectionner une agence"
          className={cn(
            'flex w-full h-10 items-center justify-between gap-2 px-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
            !activeWorkspace && 'text-muted-foreground'
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <div className="flex h-6 w-6 items-center justify-center rounded-md border bg-background">
              <Building2 className="h-3.5 w-3.5" />
            </div>
            <span className="truncate font-medium text-xs">
              {activeWorkspace?.name || "Sélectionner..."}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandList>
              <CommandInput placeholder="Rechercher une agence..." />
              <CommandEmpty>Aucune agence trouvée.</CommandEmpty>
              <CommandGroup heading="Vos Agences">
                {workspaces.map((workspace) => (
                  <CommandItem
                    key={workspace.id}
                    onSelect={() => onWorkspaceSelect(workspace)}
                    className="text-xs"
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    {workspace.name}
                    <Check
                      className={cn(
                        'ml-auto h-4 w-4',
                        activeWorkspace?.id === workspace.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false)
                    setCreateOpen(true)
                  }}
                  className="text-xs"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Créer une agence
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Nouvelle agence</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label className="text-xs">Nom de l'agence</Label>
            <Input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Mon Agence"
              onKeyDown={e => e.key === 'Enter' && handleCreateWorkspace()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Annuler</Button>
            <Button size="sm" onClick={handleCreateWorkspace} disabled={creating || !newName.trim()}>
              {creating ? 'Création...' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
