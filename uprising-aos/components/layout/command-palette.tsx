'use client'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useCommandPalette } from '@/hooks/use-command-palette'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

const NAVIGATION_ITEMS = [
  { label: 'Dashboard', href: '/os', group: 'Navigation' },
  { label: 'Contenu', href: '/os/content', group: 'Navigation' },
  { label: 'Clients (CRM)', href: '/os/clients', group: 'Navigation' },
  { label: 'Pipeline', href: '/os/pipeline', group: 'Navigation' },
  { label: 'Livrables', href: '/os/deliverables', group: 'Navigation' },
  { label: 'Prospection', href: '/os/prospection', group: 'Navigation' },
  { label: 'Finances', href: '/os/finances', group: 'Navigation' },
  { label: 'Équipe', href: '/os/team', group: 'Navigation' },
  { label: 'Hub IA', href: '/os/ai', group: 'Navigation' },
  { label: 'Paramètres', href: '/os/settings', group: 'Navigation' },
  { label: 'Nouveau post', href: '/os/content/new', group: 'Actions' },
  { label: 'Nouveau client', href: '/os/clients/new', group: 'Actions' },
  { label: 'Générateur email froid', href: '/os/prospection/email-gen', group: 'Actions' },
]

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette()
  const router = useRouter()

  const handleSelect = useCallback((href: string) => {
    router.push(href)
    setOpen(false)
  }, [router, setOpen])

  const groups = [...new Set(NAVIGATION_ITEMS.map(i => i.group))]

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Rechercher ou naviguer..." />
      <CommandList>
        <CommandEmpty>Aucun résultat.</CommandEmpty>
        {groups.map((group, idx) => (
          <div key={group}>
            {idx > 0 && <CommandSeparator />}
            <CommandGroup heading={group}>
              {NAVIGATION_ITEMS.filter(i => i.group === group).map(item => (
                <CommandItem key={item.href} onSelect={() => handleSelect(item.href)}>
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
