const METRICOOL_API_KEY = process.env.METRICOOL_API_KEY

export interface ReelsStats {
  views: number
  likes: number
  comments: number
  shares: number
  engagement: number
}

export async function fetchMetricoolReelsStats(blogId?: string): Promise<ReelsStats | null> {
  if (!METRICOOL_API_KEY || !blogId) {
    return null
  }

  try {
    const response = await fetch(`https://api.metricool.com/api/v1/stats/instagram/reels?blogId=${blogId}`, {
      headers: {
        'Authorization': `Bearer ${METRICOOL_API_KEY}`
      },
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    return {
      views: data.views || 0,
      likes: data.likes || 0,
      comments: data.comments || 0,
      shares: data.shares || 0,
      engagement: data.engagement || 0
    }
  } catch {
    return null
  }
}
