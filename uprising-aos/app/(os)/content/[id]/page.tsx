import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function ContentDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
          <Link href="/os/content"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Post #{params.id}</h1>
          <p className="text-muted-foreground text-sm">Détail du post</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Coming soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Détail et édition du post — intégration Supabase à venir.</p>
        </CardContent>
      </Card>
    </div>
  )
}
