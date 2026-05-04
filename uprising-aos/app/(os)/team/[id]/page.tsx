import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CheckinClient } from './checkin-client'
import { CompensationCard } from '@/components/shared/compensation-card'
import { Progress } from '@/components/ui/progress'
import type { TeamMember } from '@/types'

export default async function TeamMemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: memberData } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', id)
    .single()

  const member = memberData as unknown as TeamMember

  if (!member) {
    notFound()
  }

  // Fetch Stats and Compensation (using as any because of dynamic views)
  const { data: statsData } = await (supabase as any)
    .from('member_deliverables_stats')
    .select('*')
    .eq('member_name', member.name)
    .single()

  const { data: compData } = await (supabase as any)
    .from('compensation_estimates')
    .select('*')
    .eq('member_id', id)
    .single()

  const { data: checkins } = await supabase
    .from('team_checkins')
    .select('*')
    .eq('team_member_id', id)
    .order('created_at', { ascending: false })

  const stats = statsData || { total_deliverables: 0, completed_deliverables: 0, avg_progress: 0 }
  const compensation = compData || { total_monthly_revenue: 0, estimated_compensation: 0 }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link href="/os/team"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Profil Membre</h1>
          <p className="text-muted-foreground text-sm">Performances et check-ins</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <Avatar className="h-24 w-24 mx-auto">
                <AvatarFallback className="text-2xl">{member.name[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{member.name}</h2>
                <Badge variant="secondary" className="mt-1">{member.role}</Badge>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {(member.skills || []).map((skill: string) => (
                  <Badge key={skill} variant="outline" className="text-[10px] uppercase tracking-wider">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Real Compensation Tracker */}
          <CompensationCard 
            revenueShare={member.revenue_share}
            totalMonthlyRevenue={compensation.total_monthly_revenue}
            estimatedCompensation={compensation.estimated_compensation}
          />

          {/* Quick KPIs */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Productivité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Livrables complétés</span>
                <span className="font-bold">{stats.completed_deliverables} / {stats.total_deliverables}</span>
              </div>
              <Progress value={stats.total_deliverables > 0 ? (stats.completed_deliverables / stats.total_deliverables) * 100 : 0} className="h-1.5" />
              
              <div className="flex justify-between text-xs pt-2">
                <span className="text-muted-foreground">Progression moyenne</span>
                <span className="font-bold">{stats.avg_progress}%</span>
              </div>
              <Progress value={stats.avg_progress} className="h-1.5" />
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Check-ins Hebdomadaires</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckinClient memberId={id} initialCheckins={checkins || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
