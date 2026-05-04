import { getCampaigns } from '@/lib/brevo'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const campaigns = await getCampaigns()
    return NextResponse.json(campaigns)
  } catch (error) {
    return NextResponse.json({ error: 'Erreur Brevo API' }, { status: 500 })
  }
}
