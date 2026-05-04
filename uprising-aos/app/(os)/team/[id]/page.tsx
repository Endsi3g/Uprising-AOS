import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { CheckinClient } from './checkin-client'
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

  const { data: checkins } = await supabase
    .from('team_checkins')
    .select('*')
    .eq('team_member_id', id)
    .order('created_at', { ascending: false })

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
                <p className="text-muted-foreground text-sm">{member.role}</p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5">
                {(member.skills || []).map((skill: string) => (
                  <Badge key={skill} variant="secondary" className="text-xs">{skill}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Compensation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Revenue Share</span>
                <span className="font-bold text-lg text-green-500">{member.revenue_share}%</span>
              </div>
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
