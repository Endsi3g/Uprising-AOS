import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { Plus, Calendar, Kanban } from 'lucide-react'

const MOCK_POSTS = [
  { id: '1', title: 'Comment obtenir vos 3 premiers clients', type: 'TOF' as const, status: 'idea' as const, platform: 'instagram' as const, publish_date: '2026-05-10', views: 0 },
  { id: '2', title: 'Notre process de redesign web en 5 étapes', type: 'MOF' as const, status: 'script' as const, platform: 'instagram' as const, publish_date: '2026-05-12', views: 0 },
  { id: '3', title: 'Résultats client Tremblay Construction', type: 'MOF' as const, status: 'filming' as const, platform: 'instagram' as const, publish_date: '2026-05-15', views: 0 },
  { id: '4', title: 'Pourquoi votre site web perd des clients', type: 'TOF' as const, status: 'published' as const, platform: 'instagram' as const, publish_date: '2026-05-01', views: 4200 },
]

const TYPE_COLORS: Record<string, string> = {
  TOF: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  MOF: 'bg-green-500/10 text-green-500 border-green-500/20',
  BOF: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
}

const STATUS_LABELS: Record<string, string> = {
  idea: 'Idée',
  script: 'Script',
  filming: 'Tournage',
  editing: 'Montage',
  published: 'Publié',
}

const KANBAN_STAGES = ['idea', 'script', 'filming', 'editing', 'published']

export default function ContentPage() {
  const tofCount = MOCK_POSTS.filter(p => p.type === 'TOF').length
  const tofRatio = Math.round((tofCount / MOCK_POSTS.length) * 100)

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
          {tofRatio < 70 && (
            <p className="text-xs text-yellow-500 mt-1">Objectif : 75% TOF minimum</p>
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
          <div className="grid grid-cols-5 gap-3">
            {KANBAN_STAGES.map(stage => (
              <div key={stage} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {STATUS_LABELS[stage]}
                  </span>
                  <Badge variant="secondary" className="text-xs h-4">
                    {MOCK_POSTS.filter(p => p.status === stage).length}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {MOCK_POSTS.filter(p => p.status === stage).map(post => (
                    <Link key={post.id} href={`/os/content/${post.id}`}>
                      <Card className="cursor-pointer hover:border-primary/50 transition-colors">
                        <CardContent className="p-3 space-y-2">
                          <p className="text-xs font-medium leading-tight">{post.title}</p>
                          <div className="flex gap-1 flex-wrap">
                            <Badge className={`${TYPE_COLORS[post.type]} text-[10px] h-4`}>{post.type}</Badge>
                            <Badge variant="outline" className="text-[10px] h-4">{post.platform}</Badge>
                          </div>
                          {post.publish_date && (
                            <p className="text-[10px] text-muted-foreground">{post.publish_date}</p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center py-8">
                Calendrier interactif — composant Calendar shadcn à intégrer
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
