'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useTheme } from 'next-themes'
import { MRR_GOAL_DEFAULT, APP_NAME } from '@/lib/config'

const INTEGRATIONS = [
  { name: 'Supabase', status: 'connected', description: 'DB + Storage + Realtime' },
  { name: 'Clerk', status: 'connected', description: 'Auth + RBAC' },
  { name: 'Brevo', status: 'pending', description: 'Campagnes email' },
  { name: 'Todoist', status: 'pending', description: 'Sync tâches (TODOIST_API_KEY)' },
  { name: 'Metricool', status: 'pending', description: 'Stats Instagram (METRICOOL_API_KEY)' },
]

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [agencyName, setAgencyName] = useState(APP_NAME)
  const [mrrGoal, setMrrGoal] = useState(String(MRR_GOAL_DEFAULT))
  const [saving, setSaving] = useState(false)

  const [notifPref, setNotifPref] = useState<string>(() =>
    typeof window !== 'undefined' ? (localStorage.getItem('notif_pref') ?? 'all') : 'all'
  )
  const [briefingAuto, setBriefingAuto] = useState<boolean>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('briefing_auto') !== 'false' : true
  )

  async function handleSaveProfile() {
    setSaving(true)
    try {
      localStorage.setItem('agency_name', agencyName)
      localStorage.setItem('mrr_goal', mrrGoal)
      toast.success('Paramètres sauvegardés')
    } catch {
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  function handleNotifChange(value: boolean) {
    const next = value ? 'all' : 'muted'
    setNotifPref(next)
    localStorage.setItem('notif_pref', next)
    toast.success(`Notifications : ${next === 'all' ? 'activées' : 'désactivées'}`)
  }

  function handleBriefingAutoChange(value: boolean) {
    setBriefingAuto(value)
    localStorage.setItem('briefing_auto', String(value))
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground text-sm">Configuration de l'OS</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="integrations">Intégrations</TabsTrigger>
          <TabsTrigger value="preferences">Préférences</TabsTrigger>
          <TabsTrigger value="data">Données</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm">Profil Agence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nom de l'agence</Label>
                  <Input value={agencyName} onChange={e => setAgencyName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">MRR Objectif ($)</Label>
                  <Input
                    type="number"
                    value={mrrGoal}
                    onChange={e => setMrrGoal(e.target.value)}
                    min="0"
                  />
                </div>
              </div>
              <Button size="sm" onClick={handleSaveProfile} disabled={saving}>
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4 space-y-3">
          {INTEGRATIONS.map(integration => (
            <Card key={integration.name}>
              <CardContent className="pt-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{integration.name}</p>
                    <Badge
                      className={integration.status === 'connected' ? 'bg-green-500/10 text-green-500 text-[10px]' : 'bg-yellow-500/10 text-yellow-500 text-[10px]'}
                    >
                      {integration.status === 'connected' ? 'Connecté' : 'En attente'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{integration.description}</p>
                </div>
                {integration.status === 'pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => toast.info(`Configurer ${integration.name} via les variables d'environnement`)}
                  >
                    Configurer
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="preferences" className="mt-4">
          <Card>
            <CardContent className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Mode sombre</p>
                  <p className="text-xs text-muted-foreground">Thème de l'interface</p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={v => setTheme(v ? 'dark' : 'light')}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Notifications browser</p>
                  <p className="text-xs text-muted-foreground">Alertes deadlines 48h</p>
                </div>
                <Switch
                  checked={notifPref !== 'muted'}
                  onCheckedChange={handleNotifChange}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Briefing Claude automatique</p>
                  <p className="text-xs text-muted-foreground">Génère le briefing au chargement du dashboard</p>
                </div>
                <Switch
                  checked={briefingAuto}
                  onCheckedChange={handleBriefingAutoChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="mt-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm">Données & Sauvegardes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Export complet de la base</p>
                  <p className="text-xs text-muted-foreground">Télécharger les clients, deals, livrables et checkins au format JSON.</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open('/api/settings/export', '_blank')}
                >
                  Exporter en JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
