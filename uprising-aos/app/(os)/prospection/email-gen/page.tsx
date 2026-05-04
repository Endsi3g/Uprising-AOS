'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useState } from 'react'
import { Bot, Copy, Loader2, Wand2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function EmailGenForm() {
  const searchParams = useSearchParams()
  const [company, setCompany] = useState(searchParams.get('company') || '')
  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [pain, setPain] = useState('')
  const [service, setService] = useState('Refonte site web + SEO')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'cold_email', company, pain, service }),
      })
      const data = await response.json()
      setGenerated(data.content || '')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Générateur email froid</h1>
        <p className="text-muted-foreground text-sm">Outbound Strategist via Claude API</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-sm">Paramètres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Entreprise</Label>
              <Input value={company} onChange={e => setCompany(e.target.value)} placeholder="Nom de l'entreprise" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="contact@entreprise.ca" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Pain point identifié</Label>
            <Input value={pain} onChange={e => setPain(e.target.value)} placeholder="Ex: Site web désuet, pas de présence locale..." />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Service offert</Label>
            <Input value={service} onChange={e => setService(e.target.value)} />
          </div>
          <Button onClick={handleGenerate} disabled={loading || !company} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            Générer avec Claude
          </Button>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="pt-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      )}

      {generated && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm">Email généré</CardTitle>
            </div>
            <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={() => navigator.clipboard.writeText(generated)}>
              <Copy className="h-3 w-3" />Copier
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="text-sm whitespace-pre-wrap font-mono bg-muted/30 rounded p-3">{generated}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function EmailGenPage() {
  return (
    <Suspense>
      <EmailGenForm />
    </Suspense>
  )
}
