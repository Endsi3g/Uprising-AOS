'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { addTeamCheckin } from '../actions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

type Checkin = {
  id: string
  content: string
  created_at: string
}

export function CheckinClient({ memberId, initialCheckins }: { memberId: string, initialCheckins: Checkin[] }) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkins, setCheckins] = useState<Checkin[]>(initialCheckins)

  const handleSubmit = async () => {
    if (!content.trim()) return
    setIsSubmitting(true)

    const res = await addTeamCheckin(memberId, content)
    if (res.success) {
      toast.success('Check-in ajouté')
      setCheckins([{ id: Date.now().toString(), content, created_at: new Date().toISOString() }, ...checkins])
      setContent('')
    } else {
      toast.error('Erreur lors de l\'ajout du check-in')
    }
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Textarea 
          placeholder="Qu'avez-vous accompli cette semaine ? Quels sont les bloqueurs ?" 
          value={content}
          onChange={e => setContent(e.target.value)}
          className="min-h-[100px]"
        />
        <div className="flex justify-end">
          <Button onClick={handleSubmit} disabled={isSubmitting || !content.trim()}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Soumettre
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Historique</h3>
        {checkins.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun check-in enregistré.</p>
        ) : (
          checkins.map(c => (
            <div key={c.id} className="p-4 rounded-lg bg-muted/30 border text-sm space-y-2">
              <p className="whitespace-pre-wrap">{c.content}</p>
              <p className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString('fr-CA')}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
