'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateDealStage(dealId: string, newStage: string) {
  const supabase = await createClient()

  const { error } = await (supabase as any)
    .from('deals')
    .update({
      stage: newStage,
      updated_at: new Date().toISOString()
    })
    .eq('id', dealId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/os/pipeline')
  return { success: true }
}

export async function saveDeal(dealData: any, isNew: boolean = true) {
  const supabase = await createClient()

  let result
  if (isNew) {
    result = await (supabase as any).from('deals').insert([dealData])
  } else {
    result = await (supabase as any)
      .from('deals')
      .update({ ...dealData, updated_at: new Date().toISOString() })
      .eq('id', dealData.id)
  }

  if (result.error) {
    return { success: false, error: result.error.message }
  }

  revalidatePath('/os/pipeline')
  return { success: true }
}
