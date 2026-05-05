import { createClient } from '@/lib/supabase/server'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

import type { TeamMember } from '@/types'

const ROLE_LABELS: Record<string, string> = { founder: 'Fondateur', ops: 'Opérations', sales: 'Sales' }
const ROLE_COLORS: Record<string, string> = { founder: 'bg-blue-500/10 text-blue-500', ops: 'bg-green-500/10 text-green-500', sales: 'bg-purple-500/10 text-purple-500' }

export default async function TeamPage() {
  const supabase = await createClient()

  const { data: teamData } = await supabase
    .from('team_members')
    .select('*')
    .eq('active', true)

  const team = (teamData as unknown as TeamMember[]) || []

  // Fetch KPIs for all active members
  const { data: rawStats } = await supabase
    .from('member_deliverables_stats' as any)
    .select('*')
  const statsData = rawStats as Array<{ member_name: string; total_deliverables: number; completed_deliverables: number }> | null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Équipe</h1>
        <p className="text-muted-foreground text-sm">{team.length} membres actifs</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {team.map(member => {
          const stats = (statsData || []).find(s => s.member_name === member.name)
          const completionRate = stats && stats.total_deliverables > 0 
            ? Math.round((stats.completed_deliverables / stats.total_deliverables) * 100) 
            : 0

          return (
            <Link href={`/os/team/${member.id}`} key={member.id} className="block transition-transform hover:scale-[1.01]">
              <Card className="h-full hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{member.name[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{member.name}</p>
                        <Badge className={`${ROLE_COLORS[member.role]} text-xs`}>{ROLE_LABELS[member.role] || member.role}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Revenue share: {member.revenue_share}%</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Compétences</p>
                    <div className="flex gap-1 flex-wrap">
                      {(member.skills || []).map((skill: string) => (
                        <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Livrables complétés</span>
                      <span className="font-medium">{completionRate}% ({stats?.completed_deliverables || 0}/{stats?.total_deliverables || 0})</span>
                    </div>
                    <Progress value={completionRate} className="h-1.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
