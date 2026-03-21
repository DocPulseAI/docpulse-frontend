import React from 'react'
import { AlertCircle, FileText, Layout, ShieldAlert } from 'lucide-react'

interface CommitSummaryCardProps {
    summary: any
}

const CommitSummaryCard: React.FC<CommitSummaryCardProps> = ({ summary }) => {
    if (!summary) return null

    const riskLevel = summary.risk_level || summary.risk || 'low'
    const riskColor = riskLevel === 'critical' ? 'text-red-600' : riskLevel === 'high' ? 'text-orange-600' : 'text-green-600'
    const riskBg = riskLevel === 'critical' ? 'bg-red-50' : riskLevel === 'high' ? 'bg-orange-50' : 'bg-green-50'

    return (
        <div className="cr-analysis-card">
            <div className="cr-analysis-card-header">
                <ShieldAlert size={18} className={riskColor} />
                <h3 className="text-lg font-semibold ml-2">Commit Intelligence</h3>
                <span className={`ml-auto px-2 py-0.5 rounded text-xs font-bold uppercase ${riskBg} ${riskColor}`}>
                    {riskLevel} Risk
                </span>
            </div>

            <div className="mt-4 space-y-4">
                <p className="text-slate-600 text-sm leading-relaxed">
                    {summary.summary || "No summary available for this commit."}
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <FileText size={16} className="text-blue-500 mt-0.5" />
                        <div>
                            <span className="block text-xs text-slate-400 uppercase font-bold">Files Changed</span>
                            <span className="text-sm font-semibold text-slate-700">{summary.files_changed?.length || 0} files</span>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <Layout size={16} className="text-purple-500 mt-0.5" />
                        <div>
                            <span className="block text-xs text-slate-400 uppercase font-bold">Affected Modules</span>
                            <span className="text-sm font-semibold text-slate-700">{summary.affected_modules?.length || 0} modules</span>
                        </div>
                    </div>
                </div>

                {summary.breaking_changes && summary.breaking_changes.length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                        <div className="flex items-center text-red-700 mb-1">
                            <AlertCircle size={14} className="mr-1.5" />
                            <span className="text-xs font-bold uppercase">Breaking Changes Detected</span>
                        </div>
                        <ul className="text-xs text-red-600 list-disc list-inside space-y-1">
                            {summary.breaking_changes.map((change: string, i: number) => (
                                <li key={i}>{change}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CommitSummaryCard
