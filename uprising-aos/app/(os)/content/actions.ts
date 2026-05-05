'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updatePostStatus(postId: string, newStatus: string) {
  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('content_posts')
    .update({ status: newStatus })
    .eq('id', postId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/os/content')
  return { success: true }
}
