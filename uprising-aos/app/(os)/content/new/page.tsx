'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import { Bot, Loader2, Wand2 } from 'lucide-react'
import { useCompletion } from '@ai-sdk/react'

export default function NewContentPage() {
  const [topic, setTopic] = useState('')
  const [type, setType] = useState<'TOF' | 'MOF' | 'BOF'>('TOF')
  const [platform, setPlatform] = useState<'instagram' | 'tiktok'>('instagram')

  const { completion, complete, isLoading } = useCompletion({
    api: '/api/claude',
  })

  const handleGenerate = async () => {
    if (!topic) return
    await complete('', {
      body: {
        type: 'hook',
        topic,
        contentType: type,
      }
    })
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Nouveau post</h1>
        <p className="text-muted-foreground text-sm">Créer et générer du contenu avec Claude</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm">Informations du post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Sujet / Titre</Label>
            <Input placeholder="Ex: Comment obtenir vos premiers clients..." value={topic} onChange={e => setTopic(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Type de contenu</Label>
              <Select value={type} onValueChange={v => setType(v as 'TOF' | 'MOF' | 'BOF')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TOF">TOF — Top of Funnel</SelectItem>
                  <SelectItem value="MOF">MOF — Middle of Funnel</SelectItem>
                  <SelectItem value="BOF">BOF — Bottom of Funnel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Plateforme</Label>
              <Select value={platform} onValueChange={v => setPlatform(v as 'instagram' | 'tiktok')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Claude Generator */}
      <Card>
        <CardHeader className="pb-4 flex flex-row items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">Générateur Claude — Instagram Curator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGenerate} disabled={isLoading || !topic} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Générer hooks & script
          </Button>

          {isLoading && !completion && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          )}

          {completion && (
            <div className="rounded-md border bg-muted/30 p-4">
              <pre className="text-sm whitespace-pre-wrap font-mono">{completion}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Script */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm">Script du post</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea placeholder="Script, texte, description..." className="min-h-32" />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button>Sauvegarder</Button>
        <Button variant="outline">Annuler</Button>
      </div>
    </div>
  )
}
