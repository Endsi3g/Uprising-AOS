'use client'

import { Button } from '@/components/ui/button'
import { useCommandPalette } from '@/hooks/use-command-palette'
import { Search, Bell } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'

export function Topbar({ title }: { title?: string }) {
  const { toggle } = useCommandPalette()

  return (
    <header className="flex items-center justify-between border-b px-6 py-3 bg-background">
      <div className="flex items-center gap-3">
        {title && <h1 className="text-sm font-semibold">{title}</h1>}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-muted-foreground text-xs h-8"
          onClick={toggle}
        >
          <Search className="h-3.5 w-3.5" />
          Rechercher...
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground border rounded px-1">⌘K</span>
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bell className="h-4 w-4" />
        </Button>
        <UserButton />
      </div>
    </header>
  )
}
