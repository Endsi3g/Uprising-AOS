import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function generateContent(prompt: string): Promise<string> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })
  const content = message.content[0]
  return content.type === 'text' ? content.text : ''
}

export async function streamContent(prompt: string, onChunk: (text: string) => void): Promise<void> {
  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
      onChunk(chunk.delta.text)
    }
  }
}

export const contentPrompts = {
  instagramHook: (topic: string, type: 'TOF' | 'MOF' | 'BOF') =>
    `Tu es un expert en contenu Instagram pour agences créatives québécoises. Génère 3 hooks percutants pour un Reel ${type} sur le sujet : "${topic}". Format : liste numérotée, max 150 caractères par hook.`,

  reelScript: (topic: string, duration: number) =>
    `Écris un script complet pour un Reel Instagram de ${duration} secondes sur : "${topic}". Structure : Hook (3s) → Problème (5s) → Solution (10s) → CTA (5s). Inclus les indications visuelles.`,

  coldEmail: (company: string, pain: string, service: string) =>
    `Écris un email froid pour prospecter ${company}. Pain point identifié : ${pain}. Service offert : ${service}. Ton : direct, québécois, professionnel. Max 150 mots. Inclus un CTA clair.`,

  clientReport: (clientName: string, services: string[], metrics: Record<string, string | number>) =>
    `Génère un rapport mensuel professionnel pour ${clientName}. Services : ${services.join(', ')}. Métriques : ${JSON.stringify(metrics)}. Format structuré avec sections : Résumé, Réalisations, Métriques clés, Prochaines étapes.`,

  dailyBriefing: (data: { deliverables: number; leads: number; pipeline: number; tofRatio: number }) =>
    `En tant qu'agent IA de l'Agency OS Uprising Studio, génère le briefing du jour. Données : ${data.deliverables} livrables en cours, ${data.leads} leads actifs, pipeline ${data.pipeline}$, ratio TOF/MOF ${data.tofRatio}%. Donne les 3 priorités du jour avec actions concrètes. Sois concis et actionnable.`,
}
