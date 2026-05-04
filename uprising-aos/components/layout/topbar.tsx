'use client'

import { Button } from '@/components/ui/button'
import { useCommandPalette } from '@/hooks/use-command-palette'
import { Search, Bell, Moon, Sun, Settings, LogOut, User, Shield, Zap, ChevronRight } from 'lucide-react'
import { UserButton, useClerk } from '@clerk/nextjs'
import { MobileSidebar } from '@/components/layout/sidebar'
import { useTheme } from 'next-themes'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuPage,
  DropdownMenuPageTrigger,
} from '@/components/ui/material-ui-dropdown-menu'

export function Topbar({ title }: { title?: string }) {
  const { toggle } = useCommandPalette()
  const { setTheme, theme } = useTheme()
  const { signOut } = useClerk()

  return (
    <header className="flex items-center justify-between border-b px-4 md:px-6 py-3 bg-background">
      <div className="flex items-center gap-3">
        {/* Mobile hamburger */}
        <MobileSidebar />
        {title && <h1 className="text-sm font-semibold">{title}</h1>}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex gap-2 text-muted-foreground text-xs h-8"
          onClick={toggle}
        >
          <Search className="h-3.5 w-3.5" />
          Rechercher...
          <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground border rounded px-1">⌘K</span>
        </Button>
        {/* Mobile search icon only */}
        <Button variant="ghost" size="icon" className="sm:hidden h-8 w-8" onClick={toggle}>
          <Search className="h-4 w-4" />
        </Button>

        {/* Global Settings & Profile Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 rounded-full bg-accent flex items-center justify-center hover:bg-accent/80 transition-colors overflow-hidden">
            <Settings className="h-4 w-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-[16rem]" side="bottom" align="end">
            <DropdownMenuPage id="main">
              <DropdownMenuLabel>Réglages Rapides</DropdownMenuLabel>
              
              <DropdownMenuPageTrigger targetId="theme">
                {theme === 'dark' ? <Moon className="w-4 h-4 mr-2 opacity-70" /> : <Sun className="w-4 h-4 mr-2 opacity-70" />}
                <span>Apparence</span>
              </DropdownMenuPageTrigger>

              <DropdownMenuPageTrigger targetId="notifications">
                <Bell className="w-4 h-4 mr-2 opacity-70" />
                <span>Notifications</span>
              </DropdownMenuPageTrigger>

              <DropdownMenuSeparator />
              
              <DropdownMenuItem onSelect={() => (window.location.href = '/os/settings')}>
                <User className="w-4 h-4 mr-2 opacity-70" />
                <span>Mon Profil</span>
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={() => (window.location.href = '/os/settings')}>
                <Shield className="w-4 h-4 mr-2 opacity-70" />
                <span>Sécurité</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onSelect={() => signOut()}>
                <LogOut className="w-4 h-4 mr-2" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuPage>

            {/* Theme Submenu */}
            <DropdownMenuPage id="theme">
              <DropdownMenuItem onSelect={() => setTheme('light')}>
                <Sun className="w-4 h-4 mr-2 opacity-70" />
                <span>Clair</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTheme('dark')}>
                <Moon className="w-4 h-4 mr-2 opacity-70" />
                <span>Sombre</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTheme('system')}>
                <Zap className="w-4 h-4 mr-2 opacity-70" />
                <span>Système</span>
              </DropdownMenuItem>
            </DropdownMenuPage>

            {/* Notifications Submenu */}
            <DropdownMenuPage id="notifications">
              <DropdownMenuItem>
                <span>Toutes les notifications</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Seulement les mentions</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Muet</span>
              </DropdownMenuItem>
            </DropdownMenuPage>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center ml-1">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </header>
  )
}
