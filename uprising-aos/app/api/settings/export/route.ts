import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { rateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Rate limiting pour les exports (plus strict: 2 req / min)
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'anonymous'
    const rateLimitResult = rateLimit(`export-${ip}`, { limit: 2, windowSec: 60 })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer dans ' + rateLimitResult.resetIn + 's.' },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.resetIn) } }
      )
    }

    const supabase = await createClient()

    // Fetch all critical data
    const [
      { data: clients },
      { data: deals },
      { data: deliverables },
      { data: checkins }
    ] = await Promise.all([
      supabase.from('clients').select('*'),
      supabase.from('deals').select('*'),
      supabase.from('deliverables').select('*'),
      supabase.from('team_checkins').select('*')
    ])

    const exportData = {
      exported_at: new Date().toISOString(),
      exported_by: userId,
      version: '1.0',
      data: {
        clients: clients || [],
        deals: deals || [],
        deliverables: deliverables || [],
        team_checkins: checkins || []
      }
    }

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="uprising-aos-backup-${new Date().toISOString().split('T')[0]}.json"`
      }
    })
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}
