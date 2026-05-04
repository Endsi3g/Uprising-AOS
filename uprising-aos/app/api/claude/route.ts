import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import { headers } from 'next/headers'

// Zod validation schema
const ClaudeRequestSchema = z.object({
  prompt: z.string().optional(),
  topic: z.string().optional(),
  contentType: z.enum(['TOF', 'MOF', 'BOF']).optional(),
  type: z.enum(['hook', 'script', 'proposal', 'briefing']).optional(),
  dealData: z.object({
    company: z.string().optional(),
    value: z.number().optional(),
    notes: z.string().optional(),
  }).optional(),
  kpis: z.record(z.string(), z.unknown()).optional(),
  tasks: z.array(z.unknown()).optional(),
})

export async function POST(req: Request) {
  try {
    // Rate limiting: 10 requests per minute per IP
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'anonymous'
    const rateLimitResult = rateLimit(ip, { limit: 10, windowSec: 60 })

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez réessayer dans ' + rateLimitResult.resetIn + 's.' },
        { status: 429, headers: { 'Retry-After': String(rateLimitResult.resetIn) } }
      )
    }

    // Validate request body
    const body = await req.json()
    const parsed = ClaudeRequestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Requête invalide', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { prompt, topic, contentType, type, dealData, kpis, tasks } = parsed.data

    let systemPrompt = 'Vous êtes un expert en marketing digital.'
    let userMessage = prompt || `Sujet: ${topic}`

    if (type === 'hook' || type === 'script') {
      systemPrompt = `
Vous êtes un expert en création de contenu organique pour les agences (Instagram/TikTok).
Générez des idées de hooks ou un script percutant pour le sujet demandé.
Le type de contenu est : ${contentType} (TOF = Top of Funnel, MOF = Middle of Funnel, BOF = Bottom of Funnel).
Utilisez un ton direct, professionnel et orienté valeur.
      `.trim()
    } else if (type === 'proposal') {
      systemPrompt = `
Vous êtes un expert en vente B2B et directeur de compte pour une agence digitale.
Rédigez un brouillon de proposition commerciale (méthode Trifecta : 3 options de prix) basé sur les informations fournies.
La proposition doit être convaincante, structurée, et inciter à la décision.
      `.trim()
      userMessage = `
Entreprise : ${dealData?.company || 'Non spécifié'}
Projet : ${topic}
Valeur estimée : ${dealData?.value || 0}$
Notes additionnelles : ${dealData?.notes || 'Aucune'}

Générez la proposition Trifecta (Option 1: Base, Option 2: Recommandée, Option 3: Premium) pour ce client.
      `.trim()
    } else if (type === 'briefing') {
      systemPrompt = `
Vous êtes le COO d'une agence de marketing digital performante.
Analysez les KPIs fournis et générez un briefing quotidien concis (max 150 mots).
Identifiez les points critiques, les opportunités et une action prioritaire pour aujourd'hui.
Format: bullet points. Ton: direct, factuel, orienté action.
      `.trim()
      userMessage = `KPIs du jour: ${JSON.stringify(kpis, null, 2)}\nTâches prioritaires Todoist: ${JSON.stringify(tasks?.slice(0, 5))}`
    }

    const result = streamText({
      model: anthropic('claude-3-5-sonnet-latest'),
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    return result.toTextStreamResponse()
  } catch (error: any) {
    console.error('Claude API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
