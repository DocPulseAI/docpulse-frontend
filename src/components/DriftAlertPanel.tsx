import React from 'react'
import { AlertTriangle, CheckCircle2, Link2Off, FileWarning, Layers } from 'lucide-react'

interface DriftAlertPanelProps {
    drift: any
}

const DriftAlertPanel: React.FC<DriftAlertPanelProps> = ({ drift }) => {
    if (!drift) return null

    const hasDrift = drift.drift_detected

    return (
        <div className={`cr-analysis-card ${hasDrift ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-green-500'}`}>
            <div className="cr-analysis-card-header">
                {hasDrift ? (
                    <AlertTriangle size={18} className="text-orange-500" />
                ) : (
                    <CheckCircle2 size={18} className="text-green-500" />
                )}
                <h3 className="text-lg font-semibold ml-2">Documentation Drift</h3>
            </div>

            {hasDrift && (
                <div className="mt-2 text-sm text-orange-700 font-medium">
                    ⚠️ Documentation is out of sync with the code.
                </div>
            )}

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-slate-600">
                            <Link2Off size={14} className="mr-2 text-red-400" />
                            <span>Missing Endpoints</span>
                        </div>
                        <span className="font-mono font-bold">{drift.missing_endpoints?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-slate-600">
                            <FileWarning size={14} className="mr-2 text-orange-400" />
                            <span>Obsolete Endpoints</span>
                        </div>
                        <span className="font-mono font-bold">{drift.obsolete_endpoints?.length || 0}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-slate-600">
                            <Layers size={14} className="mr-2 text-blue-400" />
                            <span>Schema Changes</span>
                        </div>
                        <span className="font-mono font-bold">{drift.schema_drift?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-slate-600">
                            <Layers size={14} className="mr-2 text-purple-400" />
                            <span>Architecture Drift</span>
                        </div>
                        <span className="font-mono font-bold">{drift.architecture_drift ? 'Yes' : 'No'}</span>
                    </div>
                </div>
            </div>

            {hasDrift && drift.missing_endpoints && drift.missing_endpoints.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="block text-xs text-slate-400 uppercase font-bold mb-2">Missing from Documentation</span>
                    <div className="flex flex-wrap gap-2">
                        {drift.missing_endpoints.slice(0, 5).map((ep: any, i: number) => (
                            <span key={i} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-mono">
                                {typeof ep === 'string' ? ep : `${ep.method} ${ep.path}`}
                            </span>
                        ))}
                        {drift.missing_endpoints.length > 5 && (
                            <span className="px-2 py-1 text-slate-400 text-xs text-italic">
                                + {drift.missing_endpoints.length - 5} more
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default DriftAlertPanel
