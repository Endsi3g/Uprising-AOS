'use client'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import {
  Bot,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  LayoutDashboard,
  Settings,
  Target,
  Users,
  Package,
  Search,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/os', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/os/content', label: 'Contenu', icon: Calendar },
  { href: '/os/clients', label: 'Clients', icon: Users },
  { href: '/os/pipeline', label: 'Pipeline', icon: Target },
  { href: '/os/deliverables', label: 'Livrables', icon: Package },
  { href: '/os/prospection', label: 'Prospection', icon: Search },
  { href: '/os/finances', label: 'Finances', icon: DollarSign },
  { href: '/os/team', label: 'Équipe', icon: BarChart3 },
  { href: '/os/ai', label: 'Hub IA', icon: Bot },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <TooltipProvider delay={0}>
      <aside
        className={cn(
          'relative flex flex-col border-r bg-sidebar h-screen transition-all duration-200',
          collapsed ? 'w-14' : 'w-56'
        )}
      >
        {/* Brand */}
        <div className={cn('flex items-center gap-2 px-3 py-4 border-b', collapsed && 'justify-center px-0')}>
          <div className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center flex-shrink-0">
            <span className="text-primary-foreground text-xs font-bold">U</span>
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-bold leading-none">Uprising</p>
              <p className="text-xs text-muted-foreground">Agency OS</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/os' && pathname.startsWith(href))
            const item = (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                  collapsed && 'justify-center px-2',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            )
            return collapsed ? (
              <Tooltip key={href}>
                <TooltipTrigger>{item}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            ) : item
          })}
        </nav>

        <Separator />

        {/* Settings */}
        <div className="p-2">
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger>
                <Link href="/os/settings" className={cn('flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground')}>
                  <Settings className="h-4 w-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Paramètres</TooltipContent>
            </Tooltip>
          ) : (
            <Link href="/os/settings" className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground">
              <Settings className="h-4 w-4" />
              <span>Paramètres</span>
            </Link>
          )}
        </div>

        {/* Collapse button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-3.5 top-6 h-7 w-7 rounded-full"
          onClick={() => setCollapsed(prev => !prev)}
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>
      </aside>
    </TooltipProvider>
  )
}
