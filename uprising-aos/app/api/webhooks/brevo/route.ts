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
  try {
    const payload = await req.json()
    
    // Check if it's an array of events (batching) or single event
    const events = Array.isArray(payload) ? payload : [payload]
    
    const supabase = await createClient()
    let updatedCount = 0

    for (const rawEvent of events) {
      const parsed = brevoWebhookSchema.safeParse(rawEvent)
      if (!parsed.success) {
        console.error('Invalid webhook payload:', parsed.error)
        continue
      }
      
      const event = parsed.data
      let newStatus = ''
      
      // Map Brevo events to Lead statuses
      if (event.event === 'opened') newStatus = 'contacted'
      else if (event.event === 'click') newStatus = 'contacted'
      else if (event.event === 'reply') newStatus = 'replied'
      
      if (newStatus) {
        const { error } = await supabase
          .from('leads')
          .update({ status: newStatus } as any)
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
