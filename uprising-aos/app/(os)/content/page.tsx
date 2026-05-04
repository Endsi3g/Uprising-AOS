import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { Plus, Calendar, Kanban } from 'lucide-react'
import { KanbanBoard } from '@/components/shared/kanban-board'
import { CalendarView } from '@/components/shared/calendar-view'
import { createClient } from '@/lib/supabase/server'
import type { ContentPost } from '@/types'

const TYPE_COLORS: Record<string, string> = {
  TOF: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  MOF: 'bg-green-500/10 text-green-500 border-green-500/20',
  BOF: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
}

export default async function ContentPage() {
  const supabase = await createClient()
  
  const { data: postsData } = await supabase
    .from('content_posts')
    .select('*')
    .order('created_at', { ascending: false })

  const posts = (postsData as unknown as ContentPost[]) || []

  const tofCount = posts.filter(p => p.type === 'TOF').length
  const tofRatio = posts.length > 0 ? Math.round((tofCount / posts.length) * 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contenu</h1>
          <p className="text-muted-foreground text-sm">Calendrier éditorial & Kanban posts</p>
        </div>
        <Button asChild size="sm">
          <Link href="/os/content/new"><Plus className="h-4 w-4 mr-1" />Nouveau post</Link>
        </Button>
      </div>

      {/* TOF/MOF Ratio */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Ratio TOF/MOF</span>
            <div className="flex gap-2">
              <Badge className={TYPE_COLORS.TOF}>TOF {tofRatio}%</Badge>
              <Badge className={TYPE_COLORS.MOF}>MOF {100 - tofRatio}%</Badge>
            </div>
          </div>
          <Progress value={tofRatio} className="h-2" />
          {posts.length > 0 && tofRatio < 70 && (
            <p className="text-xs text-yellow-500 mt-2 font-medium">⚠️ Alerte : Le ratio TOF est inférieur à 70%.</p>
          )}
        </CardContent>
      </Card>

      {/* Tabs Calendar/Kanban */}
      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban"><Kanban className="h-3.5 w-3.5 mr-1" />Kanban</TabsTrigger>
          <TabsTrigger value="calendar"><Calendar className="h-3.5 w-3.5 mr-1" />Calendrier</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-4">
          <KanbanBoard initialPosts={posts as any} />
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <CalendarView posts={posts as any} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
