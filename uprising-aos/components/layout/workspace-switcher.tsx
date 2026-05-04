'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, PlusCircle, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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
import { createClient } from '@/lib/supabase/client'

export function WorkspaceSwitcher() {
  const [open, setOpen] = useState(false)
  const [workspaces, setWorkspaces] = useState<any[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchWorkspaces() {
      const { data } = await supabase.from('workspaces').select('*')
      if (data && data.length > 0) {
        setWorkspaces(data)
        // Check localstorage or default to first
        const saved = localStorage.getItem('active_workspace_id')
        const found = data.find(w => w.id === saved) || data[0]
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
    window.location.reload() // Force reload to refresh all data with new workspace context
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="Sélectionner une agence"
          className={cn('w-full justify-between gap-2 px-2 h-10', !activeWorkspace && 'text-muted-foreground')}
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
        </Button>
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
                      activeWorkspace?.id === workspace.id
                        ? 'opacity-100'
                        : 'opacity-0'
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
                  // Rediriger vers création de workspace ou ouvrir modal
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
  )
}
