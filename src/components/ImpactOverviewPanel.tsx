import React from 'react'
import { Activity, Box, Server, Network } from 'lucide-react'

interface ImpactOverviewPanelProps {
    impact: any
}

const ImpactOverviewPanel: React.FC<ImpactOverviewPanelProps> = ({ impact }) => {
    if (!impact) return null

    const stats = [
        { label: 'Endpoints', value: impact.summary?.total_endpoints || 0, icon: Network, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Entities', value: impact.summary?.total_entities || 0, icon: Box, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Services', value: impact.summary?.total_services || 0, icon: Server, color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Modules', value: impact.architecture_reconstruction?.components?.length || 0, icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    ]

    return (
        <div className="cr-analysis-card">
            <div className="cr-analysis-card-header">
                <Activity size={18} className="text-blue-500" />
                <h3 className="text-lg font-semibold ml-2">Impact Overview</h3>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="text-center p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors">
                        <div className={`mx-auto w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center mb-2`}>
                            <stat.icon size={20} />
                        </div>
                        <span className="block text-2xl font-bold text-slate-800">{stat.value}</span>
                        <span className="text-xs text-slate-500 font-medium">{stat.label}</span>
                    </div>
                ))}
            </div>

            <div className="mt-6 space-y-3">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Top Affected Files</h4>
                <div className="space-y-2">
                    {impact.changes?.slice(0, 3).map((change: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-white border border-slate-100 text-sm">
                            <span className="text-slate-700 truncate mr-4">{change.file}</span>
                            <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-500">
                                {change.impact_score || 'N/A'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ImpactOverviewPanel
