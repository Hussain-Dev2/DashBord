'use server'

const POSTHOG_PERSONAL_API_KEY = 'phx_E52GGSV7TeD0hsjdhW7eltC8pwOsPZNXPxlBkIvNgDdaxhk'
const POSTHOG_HOST = 'https://us.posthog.com'

export interface AnalyticsData {
  dates: string[]
  pageviews: number[]
  uniqueUsers: number[]
  totalPageviews: number
  totalUsers: number
}

export interface ProjectSummary {
    id: number
    name: string
    activeUsers: number // Last 24h
    totalEvents: number // Last 24h
}

async function fetchFromPostHog(url: string) {
    const headers = {
      'Authorization': `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
      'Content-Type': 'application/json'
    }
    const res = await fetch(url, { headers, next: { revalidate: 300 } })
    if (!res.ok) {
        console.error('PostHog API Error', url, res.status, await res.text())
        return null
    }
    return res.json()
}

export async function getMultiSiteAnalytics(): Promise<ProjectSummary[]> {
    // 1. Fetch Projects
    const projectsData = await fetchFromPostHog(`${POSTHOG_HOST}/api/projects/`)
    if (!projectsData || !projectsData.results) return []

    const summaries: ProjectSummary[] = []

    // 2. For each project, fetch basic stats (Active Users in last 24h)
    // We run these in parallel
    await Promise.all(projectsData.results.map(async (project: any) => {
        // Fetch Trend for DAU (last 1 day)
        const trendUrl = `${POSTHOG_HOST}/api/projects/${project.id}/insights/trend/?events=[{"id":"$pageview","math":"dau"}]&date_from=-1d`
        const trendData = await fetchFromPostHog(trendUrl)
        
        // Sum user count (approximate for "Active Now" proxy or just Daily Active)
        let activeUsers = 0
        if (trendData && trendData.result && trendData.result[0]) {
             activeUsers = trendData.result[0].count || 0
        }

        summaries.push({
            id: project.id,
            name: project.name,
            activeUsers,
            totalEvents: 0 // Simplification: skip total events for now to save API calls
        })
    }))

    return summaries
}

export async function getAnalyticsData(projectId: string): Promise<AnalyticsData> {
  try {
    const pageviewUrl = `${POSTHOG_HOST}/api/projects/${projectId}/insights/trend/?events=[{"id":"$pageview","math":"total"}]&display=ActionsLineGraph&date_from=-7d`
    const uniqueUsersUrl = `${POSTHOG_HOST}/api/projects/${projectId}/insights/trend/?events=[{"id":"$pageview","math":"dau"}]&display=ActionsLineGraph&date_from=-7d`

    const [pvData, uuData] = await Promise.all([
      fetchFromPostHog(pageviewUrl),
      fetchFromPostHog(uniqueUsersUrl)
    ])

    const dates = pvData?.result?.[0]?.labels || []
    const pageviews = pvData?.result?.[0]?.data || []
    const uniqueUsers = uuData?.result?.[0]?.data || []

    const totalPageviews = pageviews.reduce((a: number, b: number) => a + b, 0)
    const totalUsers = uniqueUsers.reduce((a: number, b: number) => a + b, 0)

    return {
      dates,
      pageviews,
      uniqueUsers,
      totalPageviews,
      totalUsers
    }
  } catch (error) {
    console.error('Error in getAnalyticsData:', error)
    return {
      dates: [],
      pageviews: [],
      uniqueUsers: [],
      totalPageviews: 0,
      totalUsers: 0
    }
  }
}
