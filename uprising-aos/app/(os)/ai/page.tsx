'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import { Bot, Loader2, Wand2, Copy } from 'lucide-react'

const AI_TOOLS = [
  { id: 'hook', label: 'Hooks Instagram', description: 'Générer des hooks viraux pour vos Reels', agent: 'Instagram Curator' },
  { id: 'script', label: 'Script Reel', description: 'Script complet pour un Reel 30-60s', agent: 'Content Creator' },
  { id: 'email', label: 'Email froid', description: 'Email de prospection personnalisé', agent: 'Outbound Strategist' },
  { id: 'briefing', label: 'Briefing quotidien', description: 'Top 3 priorités du jour depuis vos KPIs', agent: 'Analytics Reporter' },
  { id: 'report', label: 'Rapport client', description: 'Rapport mensuel professionnel', agent: 'Studio Producer' },
  { id: 'proposal', label: 'Proposition Trifecta', description: 'Proposition commerciale 3 niveaux', agent: 'Proposal Strategist' },
]

export default function AIHubPage() {
  const [activeTab, setActiveTab] = useState('hook')
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')

  const activeTool = AI_TOOLS.find(t => t.id === activeTab)

  const handleGenerate = async () => {
    if (!prompt) return
    setLoading(true)
    setResult('')
    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: activeTab, prompt }),
      })
      const data = await response.json()
      setResult(data.content || '')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Hub IA</h1>
          <p className="text-muted-foreground text-sm">Tous les générateurs Claude centralisés</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {AI_TOOLS.map(tool => (
          <Card
            key={tool.id}
            className={`cursor-pointer transition-colors ${activeTab === tool.id ? 'border-primary' : 'hover:border-primary/50'}`}
            onClick={() => { setActiveTab(tool.id); setPrompt(''); setResult('') }}
          >
            <CardContent className="pt-4 space-y-1">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">{tool.label}</p>
                {activeTab === tool.id && <Badge variant="default" className="text-[10px]">Actif</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{tool.description}</p>
              <Badge variant="outline" className="text-[10px]">{tool.agent}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              {activeTool?.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder={`Décrivez ce que vous voulez générer pour "${activeTool?.label}"...`}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="min-h-32 resize-none"
            />
            <Button onClick={handleGenerate} disabled={loading || !prompt} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
              Générer avec Claude
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Résultat</CardTitle>
            {result && (
              <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => navigator.clipboard.writeText(result)}>
                <Copy className="h-3 w-3" />Copier
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {loading && (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              )}
              {result && (
                <pre className="text-sm whitespace-pre-wrap font-mono">{result}</pre>
              )}
              {!loading && !result && (
                <p className="text-sm text-muted-foreground text-center py-8">Le résultat apparaîtra ici</p>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
