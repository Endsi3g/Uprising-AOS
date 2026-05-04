import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

const INTEGRATIONS = [
  { name: 'Supabase', status: 'connected', description: 'DB + Storage + Realtime' },
  { name: 'Clerk', status: 'connected', description: 'Auth + RBAC' },
  { name: 'Brevo', status: 'pending', description: 'Campagnes email' },
  { name: 'Todoist', status: 'pending', description: 'Sync tâches Xavier' },
  { name: 'Metricool', status: 'pending', description: 'Stats Instagram' },
]

export default function SettingsPage() {
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
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm">Profil Uprising Studio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nom de l'agence</Label>
                  <Input defaultValue="Uprising Studio" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">MRR Objectif</Label>
                  <Input defaultValue="8000" type="number" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Clé API Claude (Anthropic)</Label>
                <Input type="password" placeholder="sk-ant-..." />
              </div>
              <Button size="sm">Sauvegarder</Button>
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
                <Button variant="outline" size="sm" className="text-xs h-7">
                  {integration.status === 'connected' ? 'Gérer' : 'Connecter'}
                </Button>
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
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Notifications browser</p>
                  <p className="text-xs text-muted-foreground">Alertes deadlines 48h</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Briefing Claude automatique</p>
                  <p className="text-xs text-muted-foreground">Génère le briefing au chargement du dashboard</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
