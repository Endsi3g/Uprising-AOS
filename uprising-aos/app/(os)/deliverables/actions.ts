'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleDeliverableStatus(id: string, isCompleted: boolean) {
  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('deliverables')
    .update({
      status: isCompleted ? 'completed' : 'in_progress',
      progress: isCompleted ? 100 : 50
    })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/os/deliverables')
  return { success: true }
}

export async function addComment(deliverableId: string, userId: string, _userName: string, content: string) {
  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('comments')
    .insert([{ deliverable_id: deliverableId, user_id: userId, content }])

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/os/deliverables/${deliverableId}`)
  return { success: true }
}
