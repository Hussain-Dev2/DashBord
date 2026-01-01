'use client'

import { useState } from 'react'
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar 
} from 'recharts'
import { Activity, Users, Eye, Globe, ChevronRight } from 'lucide-react'
import type { AnalyticsData, ProjectSummary } from './analytics'
import { getAnalyticsData } from './analytics'

export default function AnalyticsClient({ initialProjects }: { initialProjects: ProjectSummary[] }) {
  const [selectedProject, setSelectedProject] = useState<ProjectSummary | null>(null)
  const [details, setDetails] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSelectProject = async (project: ProjectSummary) => {
    setSelectedProject(project)
    setLoading(true)
    try {
        const data = await getAnalyticsData(project.id.toString())
        setDetails(data)
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      
      {/* Overview / Site List */}
      {!selectedProject && (
        <div className="grid grid-cols-1 gap-6">

            {/* Live Visitors Comparison Chart */}
             <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-400" />
                    Activity Comparison
                </h3>
                <div className="h-[300px] w-full">
                    {initialProjects.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={initialProjects}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#666" 
                                    tick={{fill: '#9ca3af'}} 
                                    axisLine={{stroke: '#ffffff10'}} 
                                />
                                <YAxis 
                                    stroke="#666" 
                                    tick={{fill: '#9ca3af'}} 
                                    axisLine={{stroke: '#ffffff10'}} 
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: '#1a1a1a', 
                                        border: '1px solid #333', 
                                        borderRadius: '8px', 
                                        color: '#fff' 
                                    }}
                                    cursor={{fill: '#ffffff10'}}
                                />
                                <Bar 
                                    dataKey="activeUsers" 
                                    name="Active Users" 
                                    fill="#10B981" 
                                    radius={[4, 4, 0, 0]} 
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            No data available for comparison.
                        </div>
                    )}
                </div>
            </div>

            <h2 className="text-xl font-semibold text-white mb-2">My Websites</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {initialProjects.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No projects found.</div>
                ) : (
                    <div className="divide-y divide-white/10">
                        {initialProjects.map((project) => (
                            <button 
                                key={project.id}
                                onClick={() => handleSelectProject(project)}
                                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-nexa-gold/20 rounded-xl">
                                        <Globe className="w-6 h-6 text-nexa-gold" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-medium text-white">{project.name}</h3>
                                        <p className="text-sm text-gray-400">ID: {project.id}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-white">{project.activeUsers}</div>
                                        <div className="text-xs text-gray-400 uppercase tracking-wider">Active Users (24h)</div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-500" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Detail View */}
      {selectedProject && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button 
            onClick={() => setSelectedProject(null)} 
            className="mb-6 text-sm text-gray-400 hover:text-white flex items-center gap-1"
          >
            &larr; Back to All Sites
          </button>

          <div className="flex items-center justify-between mb-6">
             <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Globe className="w-6 h-6 text-nexa-gold" />
                {selectedProject.name}
             </h2>
             <div className="px-4 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium border border-green-500/30">
                Live Data
             </div>
          </div>

          {loading ? (
             <div className="h-64 flex items-center justify-center bg-white/5 rounded-2xl">
                <Activity className="w-8 h-8 text-nexa-gold animate-bounce" />
             </div>
          ) : details ? (
             <>
                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                        <Eye className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-gray-400 font-medium">Pageviews (7d)</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{details.totalPageviews}</div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-green-500/20 rounded-xl">
                        <Users className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-gray-400 font-medium">Unique Users (7d)</span>
                    </div>
                    <div className="text-3xl font-bold text-white">{details.totalUsers}</div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                        <Activity className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-gray-400 font-medium">Avg. Views/User</span>
                    </div>
                    <div className="text-3xl font-bold text-white">
                        {details.totalUsers > 0 ? (details.totalPageviews / details.totalUsers).toFixed(1) : '0'}
                    </div>
                    </div>
                </div>

                {/* Main Chart */}
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-nexa-gold" />
                        Traffic Trends
                    </h3>
                    <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={details.dates.map((d, i) => ({
                            date: new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                            pageviews: details.pageviews[i] || 0,
                            uniqueUsers: details.uniqueUsers[i] || 0
                        }))}>
                        <defs>
                            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#60A5FA" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis 
                            dataKey="date" 
                            stroke="#666" 
                            tick={{fill: '#9ca3af'}} 
                            axisLine={{stroke: '#ffffff10'}}
                        />
                        <YAxis 
                            stroke="#666" 
                            tick={{fill: '#9ca3af'}} 
                            axisLine={{stroke: '#ffffff10'}}
                        />
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: '#1a1a1a', 
                                border: '1px solid #333',
                                borderRadius: '8px',
                                color: '#fff'
                            }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="pageviews" 
                            name="Pageviews"
                            stroke="#D4AF37" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorPv)" 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="uniqueUsers" 
                            name="Unique Users"
                            stroke="#60A5FA" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorUv)" 
                        />
                        </AreaChart>
                    </ResponsiveContainer>
                    </div>
                </div>
             </>
          ) : (
             <div className="text-center text-gray-500 py-10">No data available for this project.</div>
          )}
        </div>
      )}
    </div>
  )
}
