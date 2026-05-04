import { generateContent, contentPrompts } from '@/lib/claude'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, topic, contentType, company, pain, service, prompt } = body

    let finalPrompt = prompt || ''

    if (type === 'hook' && topic) {
      finalPrompt = contentPrompts.instagramHook(topic, contentType || 'TOF')
    } else if (type === 'script' && topic) {
      finalPrompt = contentPrompts.reelScript(topic, 45)
    } else if (type === 'cold_email' && company) {
      finalPrompt = contentPrompts.coldEmail(company, pain || 'site web désuet', service || 'Refonte site web')
    } else if (type === 'briefing') {
      finalPrompt = contentPrompts.dailyBriefing({ deliverables: 2, leads: 15, pipeline: 18500, tofRatio: 72 })
    }

    if (!finalPrompt) {
      return NextResponse.json({ error: 'Prompt requis' }, { status: 400 })
    }

    const content = await generateContent(finalPrompt)
    return NextResponse.json({ content })
  } catch (error) {
    console.error('Claude API error:', error)
    return NextResponse.json({ error: 'Erreur génération' }, { status: 500 })
  }
}
