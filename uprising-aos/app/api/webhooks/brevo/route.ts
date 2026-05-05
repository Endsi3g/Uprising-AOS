import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const brevoWebhookSchema = z.object({
  event: z.string(),
  email: z.string().email(),
  id: z.number(),
  date: z.string(),
  ts: z.number(),
  messageId: z.string(),
  campaignId: z.number().optional(),
  tag: z.string().optional(),
}).passthrough()

export async function POST(req: Request) {
  const secret = process.env.BREVO_WEBHOOK_SECRET
  if (secret) {
    const token = req.headers.get('x-brevo-signature') ?? new URL(req.url).searchParams.get('secret')
    if (token !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  try {
    const payload = await req.json()
    const events = Array.isArray(payload) ? payload : [payload]
    const supabase = await createClient()
    let updatedCount = 0

    for (const rawEvent of events) {
      const parsed = brevoWebhookSchema.safeParse(rawEvent)
      if (!parsed.success) continue

      const event = parsed.data
      let newStatus = ''

      if (event.event === 'opened') newStatus = 'contacted'
      else if (event.event === 'click') newStatus = 'contacted'
      else if (event.event === 'reply') newStatus = 'replied'

      if (newStatus) {
        const { error } = await (supabase as any)
          .from('leads')
          .update({ status: newStatus })
          .eq('email', event.email)

        if (!error) updatedCount++
      }
    }

    return NextResponse.json({ success: true, updated: updatedCount })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 })
  }
}
