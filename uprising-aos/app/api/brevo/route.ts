import { NextResponse } from 'next/server'

export async function GET() {
  const BREVO_API_KEY = process.env.BREVO_API_KEY

  if (!BREVO_API_KEY || BREVO_API_KEY === 'xkeysib-...') {
    return NextResponse.json({ error: 'Brevo API key not configured' }, { status: 503 })
  }

  try {
    const [campaignsRes, statsRes] = await Promise.all([
      fetch('https://api.brevo.com/v3/emailCampaigns?status=sent&limit=10&offset=0&sort=desc', {
        headers: { 'api-key': BREVO_API_KEY, 'Accept': 'application/json' },
      }),
      fetch('https://api.brevo.com/v3/contacts?limit=1', {
        headers: { 'api-key': BREVO_API_KEY, 'Accept': 'application/json' },
      }),
    ])

    if (!campaignsRes.ok) {
      throw new Error(`Brevo API error: ${campaignsRes.status}`)
    }

    const campaignsData = await campaignsRes.json()
    const contactsData = statsRes.ok ? await statsRes.json() : { count: 0 }

    const campaigns = (campaignsData.campaigns || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      subject: c.subject,
      sentDate: c.sentDate,
      statistics: {
        sent: c.statistics?.campaignStats?.[0]?.messagesSent || 0,
        opened: c.statistics?.campaignStats?.[0]?.uniqueViews || 0,
        clicked: c.statistics?.campaignStats?.[0]?.uniqueClicks || 0,
        openRate: c.statistics?.campaignStats?.[0]?.estimatedOpenRate || 0,
        clickRate: c.statistics?.campaignStats?.[0]?.estimatedClickRate || 0,
      }
    }))

    return NextResponse.json({
      campaigns,
      totalContacts: contactsData.count || 0,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
