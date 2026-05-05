'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTeamCheckin(memberId: string, content: string) {
  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('team_checkins')
    .insert([{ team_member_id: memberId, content }])

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/os/team/${memberId}`)
  return { success: true }
}
