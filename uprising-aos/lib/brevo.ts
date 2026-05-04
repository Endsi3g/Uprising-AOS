const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_BASE_URL = 'https://api.brevo.com/v3'

async function brevoFetch(endpoint: string) {
  const response = await fetch(`${BREVO_BASE_URL}${endpoint}`, {
    headers: {
      'api-key': BREVO_API_KEY!,
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) throw new Error(`Brevo API error: ${response.status}`)
  return response.json()
}

export async function getCampaigns() {
  return brevoFetch('/emailCampaigns?status=sent&limit=20')
}

export async function getCampaignStats(campaignId: number) {
  return brevoFetch(`/emailCampaigns/${campaignId}`)
}

export async function getContacts() {
  return brevoFetch('/contacts?limit=100')
}
