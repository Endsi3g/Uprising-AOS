import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import type { TeamMember } from '@/types'

const MOCK_TEAM: TeamMember[] = [
  { id: '1', clerk_user_id: 'user_kael', name: 'Kael', role: 'founder', revenue_share: 70, skills: ['Design', 'Dev', 'Stratégie'], active: true },
  { id: '2', clerk_user_id: 'user_xavier', name: 'Xavier', role: 'ops', revenue_share: 30, skills: ['Scraping', 'CRM', 'Excel'], active: true },
]

const ROLE_LABELS: Record<string, string> = { founder: 'Fondateur', ops: 'Opérations', sales: 'Sales' }
const ROLE_COLORS: Record<string, string> = { founder: 'bg-blue-500/10 text-blue-500', ops: 'bg-green-500/10 text-green-500', sales: 'bg-purple-500/10 text-purple-500' }

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Équipe</h1>
        <p className="text-muted-foreground text-sm">{MOCK_TEAM.length} membres actifs</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {MOCK_TEAM.map(member => (
          <Card key={member.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{member.name}</p>
                    <Badge className={`${ROLE_COLORS[member.role]} text-xs`}>{ROLE_LABELS[member.role]}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Revenue share: {member.revenue_share}%</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Compétences</p>
                <div className="flex gap-1 flex-wrap">
                  {member.skills.map(skill => (
                    <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Livrables complétés</span>
                  <span className="font-medium">4/6</span>
                </div>
                <Progress value={67} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
