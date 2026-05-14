import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GitCommit, AlertTriangle, Shield, Lightbulb, CheckCircle } from 'lucide-react'
import { portalApi, PortalChanges } from '../../services/portalApi'

const RISK_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    critical: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', dot: '#ef4444' },
    high:     { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa', dot: '#f97316' },
    medium:   { bg: '#fffbeb', text: '#92400e', border: '#fde68a', dot: '#f59e0b' },
    low:      { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0', dot: '#22c55e' },
}

function RiskBadge({ level }: { level: string }) {
    const cfg = RISK_COLORS[level] ?? RISK_COLORS.low
    return (
        <span className="intel-risk-badge" style={{ background: cfg.bg, color: cfg.text, borderColor: cfg.border }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block', marginRight: 4 }} />
            {level.charAt(0).toUpperCase() + level.slice(1)}
        </span>
    )
}

const IntelligenceChanges: React.FC = () => {
    const { projectId, commitHash } = useOutletContext<{ projectId: string; commitHash: string }>()
    const [data, setData] = useState<PortalChanges | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!projectId || !commitHash) return
        setLoading(true)
        portalApi.getChanges(projectId, commitHash)
            .then(r => setData(r.data))
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [projectId, commitHash])

    if (loading) return (
        <div className="intel-page">
            {[1, 2, 3].map(i => <div key={i} className="intel-loading-skeleton" style={{ height: 80, borderRadius: 14, marginBottom: 16 }} />)}
        </div>
    )

    return (
        <div className="intel-page">
            <div className="intel-page-header">
                <h1 className="intel-page-title">
                    <span className="intel-page-title-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
                        <GitCommit size={18} />
                    </span>
                    Changes
                </h1>
                <p className="intel-page-subtitle">
                    Commit <code className="intel-mono">{commitHash?.slice(0, 7)}</code> — impact analysis
                </p>
            </div>

            {error || !data ? (
                <div className="intel-section-card">
                    <div className="intel-empty">
                        <GitCommit size={36} className="text-slate-300" />
                        <p>{error ?? 'No change data available for this commit.'}</p>
                    </div>
                </div>
            ) : (
                <div className="intel-changes-layout">
                    {/* Breaking changes */}
                    {data.breakingChanges.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="intel-breaking-alert">
                            <div className="intel-breaking-alert-header">
                                <AlertTriangle size={16} />
                                <span>{data.breakingChanges.length} Breaking Change{data.breakingChanges.length > 1 ? 's' : ''}</span>
                                <RiskBadge level="critical" />
                            </div>
                            <div className="intel-breaking-list">
                                {data.breakingChanges.map((bc: any, i: number) => (
                                    <div key={i} className="intel-breaking-item">
                                        <span className="intel-breaking-dot" />
                                        <span>{bc.description ?? bc.change ?? bc.endpoint ?? JSON.stringify(bc)}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Risk summary */}
                    {data.riskScore != null && (
                        <div className="intel-changes-risk-row">
                            <div className="intel-changes-risk-card">
                                <Shield size={16} />
                                <span className="intel-changes-risk-label">Risk Score</span>
                                <span className="intel-changes-risk-val">{data.riskScore}/100</span>
                                <RiskBadge level={data.riskLevel} />
                            </div>
                            {data.impactedModules.length > 0 && (
                                <div className="intel-changes-modules">
                                    <span className="intel-changes-modules-label">Impacted Modules</span>
                                    <div className="intel-changes-modules-list">
                                        {data.impactedModules.map(m => (
                                            <span key={m} className="intel-chip">{m}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Files changed */}
                    {data.files.length > 0 && (
                        <div className="intel-section-card" style={{ marginTop: 16 }}>
                            <div className="intel-section-card-header">
                                <div>
                                    <h3 className="intel-section-card-title">Files Changed</h3>
                                    <p className="intel-section-card-sub">{data.files.length} files modified in this commit</p>
                                </div>
                            </div>
                            <div className="intel-section-card-body intel-section-card-body--flush">
                                {data.files.map((f, i) => (
                                    <div key={i} className="intel-file-row">
                                        <div className="intel-file-dot" style={{ background: RISK_COLORS[f.riskLevel]?.dot ?? '#94a3b8' }} />
                                        <code className="intel-file-name">{f.name}</code>
                                        {f.additions != null && (
                                            <span className="intel-file-additions">+{f.additions}</span>
                                        )}
                                        {f.deletions != null && (
                                            <span className="intel-file-deletions">-{f.deletions}</span>
                                        )}
                                        <RiskBadge level={f.riskLevel} />
                                        {f.reason && <span className="intel-file-reason">{f.reason}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations */}
                    {data.recommendations.length > 0 && (
                        <div className="intel-section-card" style={{ marginTop: 16 }}>
                            <div className="intel-section-card-header">
                                <h3 className="intel-section-card-title"><Lightbulb size={14} style={{ display: 'inline', marginRight: 6, color: '#f59e0b' }} />Recommendations</h3>
                            </div>
                            <div className="intel-section-card-body">
                                {data.recommendations.map((r, i) => (
                                    <div key={i} className="intel-rec-item">
                                        <CheckCircle size={14} className="intel-rec-icon" />
                                        <span>{r}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No changes at all */}
                    {data.files.length === 0 && data.breakingChanges.length === 0 && (
                        <div className="intel-section-card">
                            <div className="intel-empty">
                                <CheckCircle size={36} className="text-green-400" />
                                <p>No significant changes detected for this commit.</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default IntelligenceChanges
