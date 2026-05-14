import React, { useEffect, useState } from 'react'

import { AlertTriangle, CheckCircle, Box, Cpu, Activity, Shield } from 'lucide-react'
import { portalApi, PortalOverview } from '../services/portalApi'
import MarkdownRenderer from '../components/MarkdownRenderer'

interface Props {
    projectId: string;
    commitHash: string;
}

const IntelligenceOverviewWidget: React.FC<Props> = ({ projectId, commitHash }) => {
    const [data, setData] = useState<PortalOverview | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!projectId || !commitHash) return
        setLoading(true)
        portalApi.getOverview(projectId, commitHash)
            .then(r => setData(r.data))
            .catch(e => setError(e.message ?? 'Failed to load overview'))
            .finally(() => setLoading(false))
    }, [projectId, commitHash])

    if (loading) return (
        <div className="cr-card">
            <div className="cr-loading" style={{ height: 200 }}><div className="cr-spinner" /></div>
        </div>
    )

    if (error || !data) return (
        <div className="cr-card">
            <div className="cr-doc-empty">
                <AlertTriangle size={36} className="text-slate-300" style={{ opacity: 0.5, marginBottom: 12 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{error ?? 'No overview data available for this commit.'}</p>
            </div>
        </div>
    )

    const { metrics, aiSummaryMarkdown, breakingChanges } = data

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div className="cr-card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', marginBottom: 12 }}>
                        <Shield size={16} /> <span style={{ fontSize: 13, fontWeight: 600 }}>Risk Score</span>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{metrics.riskScore != null ? `${metrics.riskScore}/100` : '—'}</div>
                </div>
                
                <div className="cr-card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', marginBottom: 12 }}>
                        <Activity size={16} /> <span style={{ fontSize: 13, fontWeight: 600 }}>API Endpoints</span>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{metrics.apiCount}</div>
                </div>

                <div className="cr-card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', marginBottom: 12 }}>
                        <Box size={16} /> <span style={{ fontSize: 13, fontWeight: 600 }}>Doc Coverage</span>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {metrics.docCoverage != null ? `${metrics.docCoverage}%` : '—'}
                    </div>
                </div>

                <div className="cr-card" style={{ padding: 20, borderColor: metrics.breakingChangesCount > 0 ? 'var(--severity-critical)' : 'var(--border-default)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: metrics.breakingChangesCount > 0 ? 'var(--severity-critical)' : 'var(--text-secondary)', marginBottom: 12 }}>
                        <AlertTriangle size={16} /> <span style={{ fontSize: 13, fontWeight: 600 }}>Breaking Changes</span>
                    </div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: metrics.breakingChangesCount > 0 ? 'var(--severity-critical)' : 'var(--text-primary)' }}>
                        {metrics.breakingChangesCount}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
                {/* AI Summary */}
                <div className="cr-card">
                    <div className="cr-card-header">
                        <h3 className="cr-card-title"><Cpu size={14} /> AI Architecture Summary</h3>
                    </div>
                    <div className="cr-card-body" style={{ padding: 20, maxHeight: 400, overflowY: 'auto' }}>
                        {aiSummaryMarkdown ? (
                            <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                                <MarkdownRenderer content={aiSummaryMarkdown} />
                            </div>
                        ) : (
                            <div className="cr-doc-empty">AI Summary not available.</div>
                        )}
                    </div>
                </div>

                {/* Breaking Changes List */}
                <div className="cr-card">
                    <div className="cr-card-header">
                        <h3 className="cr-card-title"><AlertTriangle size={14} /> Breaking Changes</h3>
                        {breakingChanges.length > 0 && <span className="cr-severity cr-severity--critical" style={{ fontSize: 10 }}>{breakingChanges.length} found</span>}
                    </div>
                    <div className="cr-settings-list" style={{ border: 'none', borderRadius: 0, maxHeight: 400, overflowY: 'auto' }}>
                        {breakingChanges.length === 0 ? (
                            <div className="cr-doc-empty" style={{ padding: 24 }}>
                                <CheckCircle size={24} style={{ color: 'var(--accent-green)', opacity: 0.5, marginBottom: 8 }} />
                                <p style={{ color: 'var(--text-muted)' }}>No breaking API changes detected.</p>
                            </div>
                        ) : (
                            breakingChanges.map((bc, i) => (
                                <div key={i} className="cr-settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 8, padding: '16px 20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                                        <span className="cr-severity cr-severity--critical" style={{ fontSize: 10 }}>{bc.method}</span>
                                        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{bc.path}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--severity-critical)', background: 'var(--severity-critical-glow)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', width: '100%' }}>
                                        {bc.description}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default IntelligenceOverviewWidget
