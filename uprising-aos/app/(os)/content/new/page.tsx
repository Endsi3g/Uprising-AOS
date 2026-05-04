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

export default function NewContentPage() {
  const [loading, setLoading] = useState(false)
  const [generatedContent, setGeneratedContent] = useState('')
  const [topic, setTopic] = useState('')
  const [type, setType] = useState<'TOF' | 'MOF' | 'BOF'>('TOF')
  const [platform, setPlatform] = useState<'instagram' | 'tiktok'>('instagram')

  const handleGenerate = async () => {
    if (!topic) return
    setLoading(true)
    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'hook',
          topic,
          contentType: type,
        }),
      })
      const data = await response.json()
      setGeneratedContent(data.content || '')
    } catch (error) {
      console.error('Erreur génération:', error)
    } finally {
      setLoading(false)
    }
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
          <Button onClick={handleGenerate} disabled={loading || !topic} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Générer hooks & script
          </Button>

          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          )}

          {generatedContent && (
            <div className="rounded-md border bg-muted/30 p-4">
              <pre className="text-sm whitespace-pre-wrap font-mono">{generatedContent}</pre>
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
