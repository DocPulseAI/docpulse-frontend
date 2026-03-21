import React from 'react'
import { Lightbulb, ArrowRight, CheckCircle } from 'lucide-react'

interface RecommendedActionsListProps {
    recommendations: string[]
}

const RecommendedActionsList: React.FC<RecommendedActionsListProps> = ({ recommendations }) => {
    if (!recommendations || recommendations.length === 0) return null

    return (
        <div className="cr-analysis-card">
            <div className="cr-analysis-card-header text-amber-600">
                <Lightbulb size={18} />
                <h3 className="text-lg font-semibold ml-2 text-slate-800">Developer Action Suggestions</h3>
            </div>

            <div className="mt-4 space-y-2">
                {recommendations.map((action, i) => (
                    <div key={i} className="group flex items-start space-x-3 p-3 rounded-lg border border-slate-100 bg-white hover:border-amber-200 transition-colors cursor-pointer">
                        <div className="mt-0.5">
                            <ArrowRight size={14} className="text-amber-500 group-hover:translate-x-1 transition-transform" />
                        </div>
                        <span className="text-sm text-slate-600 font-medium leading-relaxed">
                            {action}
                        </span>
                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                            <CheckCircle size={14} className="text-slate-300 hover:text-green-500" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RecommendedActionsList
