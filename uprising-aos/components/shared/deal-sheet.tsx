'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { saveDeal } from '@/app/(os)/pipeline/actions'
import { toast } from 'sonner'
import { Loader2, Wand2 } from 'lucide-react'
import { useCompletion } from '@ai-sdk/react'
import type { Deal } from '@/types'

const PIPELINE_STAGES = [
  { key: 'prospect', label: 'Prospect' },
  { key: 'discovery', label: 'Discovery' },
  { key: 'proposal', label: 'Proposition' },
  { key: 'negotiation', label: 'Négociation' },
  { key: 'closed_won', label: 'Gagné' },
  { key: 'closed_lost', label: 'Perdu' },
  { key: 'on_hold', label: 'En attente' },
]

export function DealSheet({ 
  open, 
  onOpenChange, 
  deal 
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  deal?: Deal | null 
}) {
  const [formData, setFormData] = useState<Partial<Deal>>(
    deal || {
      name: '',
      company: '',
      value: 0,
      stage: 'prospect',
      probability: 20,
      notes: ''
    }
  )
  const [isSaving, setIsSaving] = useState(false)

  const { completion, complete, isLoading: isGenerating } = useCompletion({
    api: '/api/claude',
  })

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    const isNew = !deal?.id
    const res = await saveDeal(formData, isNew)
    setIsSaving(false)

    if (res.success) {
      toast.success(isNew ? 'Deal créé' : 'Deal mis à jour')
      onOpenChange(false)
    } else {
      toast.error('Erreur lors de la sauvegarde')
    }
  }

  const handleGenerateProposal = async () => {
    if (!formData.name || !formData.company) {
      toast.error('Veuillez renseigner le nom et l\'entreprise')
      return
    }
    
    await complete('', {
      body: {
        type: 'proposal',
        topic: formData.name,
        dealData: formData
      }
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{deal ? 'Modifier le Deal' : 'Nouveau Deal'}</SheetTitle>
          <SheetDescription>Remplissez les informations du deal.</SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nom du projet</Label>
            <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} />
          </div>
          
          <div className="space-y-2">
            <Label>Entreprise</Label>
            <Input value={formData.company} onChange={e => handleChange('company', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Valeur ($)</Label>
              <Input type="number" value={formData.value} onChange={e => handleChange('value', parseFloat(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Probabilité (%)</Label>
              <Input type="number" min="0" max="100" value={formData.probability} onChange={e => handleChange('probability', parseInt(e.target.value))} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Étape (Stage)</Label>
            <Select value={formData.stage} onValueChange={v => handleChange('stage', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PIPELINE_STAGES.map(stage => (
                  <SelectItem key={stage.key} value={stage.key}>{stage.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea value={formData.notes || ''} onChange={e => handleChange('notes', e.target.value)} className="min-h-[100px]" />
          </div>

          {/* AI Generator Button */}
          <div className="pt-4 border-t mt-4">
            <Button 
              type="button" 
              variant="secondary" 
              className="w-full mb-4 gap-2" 
              onClick={handleGenerateProposal}
              disabled={isGenerating}
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Générer proposition Trifecta
            </Button>
            
            {completion && (
              <div className="rounded-md border bg-muted/30 p-4 mb-4">
                <pre className="text-xs whitespace-pre-wrap font-mono">{completion}</pre>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Sauvegarder
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
