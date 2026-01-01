import Link from 'next/link'
import { getMultiSiteAnalytics } from './analytics'
import AnalyticsClient from './AnalyticsClient'

export default async function AdminAnalyticsPage() {
  const projects = await getMultiSiteAnalytics()

  return (
    <div className="min-h-screen bg-nexa-black text-white p-6 md:p-10">
      <div className="mb-8">
        <Link href="/admin" className="text-gray-400 hover:text-white mb-4 inline-block">&larr; Back to Dashboard</Link>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-nexa-gold to-white mb-2">
            Analytics & Insights
        </h1>
        <p className="text-gray-400">View real-time performance across all your websites.</p>
      </div>

      <AnalyticsClient initialProjects={projects} />
    </div>
  )
}
