'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { addComment } from '@/app/(os)/deliverables/actions'
import { formatRelative } from 'date-fns'
import { fr } from 'date-fns/locale'

export type Comment = {
  id: string
  deliverable_id: string
  user_id: string
  user_name: string
  content: string
  created_at: string
}

export function DeliverableComments({ 
  deliverableId, 
  initialComments,
  currentUserId,
  currentUserName
}: { 
  deliverableId: string
  initialComments: Comment[]
  currentUserId: string
  currentUserName: string
}) {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to new comments for this deliverable
    const channel = supabase
      .channel('realtime_comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `deliverable_id=eq.${deliverableId}`
        },
        (payload) => {
          const newMsg = payload.new as Comment
          setComments((prev) => {
            // Prevent duplicates if the user themselves just posted it and we already updated optimistically
            if (prev.find(c => c.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [deliverableId, supabase])

  useEffect(() => {
    // Scroll to bottom on new comment
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [comments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    const content = newComment.trim()
    setNewComment('')

    // We rely on Server Action to insert. 
    // The Realtime subscription will fetch it, but we can also rely on Server Action's revalidatePath
    // Since we have Realtime, the subscription will push the new comment to state.
    await addComment(deliverableId, currentUserId, currentUserName, content)
    setIsSubmitting(false)
  }

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4" ref={scrollRef}>
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center mt-10">Aucun commentaire pour le moment.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className={`flex gap-3 ${comment.user_id === currentUserId ? 'flex-row-reverse' : ''}`}>
              <Avatar className="h-8 w-8">
                <AvatarFallback>{comment.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className={`flex flex-col ${comment.user_id === currentUserId ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xs font-semibold">{comment.user_name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatRelative(new Date(comment.created_at), new Date(), { locale: fr })}
                  </span>
                </div>
                <div className={`text-sm px-3 py-2 rounded-lg max-w-[80%] ${
                  comment.user_id === currentUserId 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  {comment.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="pt-4 border-t mt-auto">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea 
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Écrire un commentaire..."
            className="min-h-[60px] resize-none"
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e)
              }
            }}
          />
          <Button type="submit" disabled={isSubmitting || !newComment.trim()} className="h-auto">
            Envoyer
          </Button>
        </form>
      </div>
    </div>
  )
}
