'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useAuth } from '@clerk/nextjs'

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { userId } = useAuth()

  useEffect(() => {
    if (!userId) return

    const channel = supabase.channel('global-notifications')
      
    // Listen for Deals updates
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'deals' },
      (payload) => {
        // Skip notifying if it's the current user making the change (if we tracked user_id, but here we just notify generally for now or check conditions)
        if (payload.eventType === 'INSERT') {
          toast.success('Nouveau Deal ajouté', {
            description: `Le deal "${payload.new.name}" vient d'être créé.`,
          })
        } else if (payload.eventType === 'UPDATE') {
          toast.info('Deal mis à jour', {
            description: `Le deal "${payload.new.name}" est passé en "${payload.new.stage}".`,
          })
        }
      }
    )

    // Listen for Deliverables updates
    channel.on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'deliverables' },
      (payload) => {
        if (payload.new.status === 'completed' && payload.old.status !== 'completed') {
          toast.success('Livrable terminé 🎉', {
            description: `Le livrable "${payload.new.title}" a été marqué comme terminé.`,
          })
        }
      }
    )

    channel.subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, userId])

  return <>{children}</>
}
