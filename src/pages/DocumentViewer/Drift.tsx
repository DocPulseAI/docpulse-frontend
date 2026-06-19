import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { documentsApi } from '../../services/api'
import { ShieldAlert, CheckCircle, AlertCircle } from 'lucide-react'
import DocCard from '../../components/DocCard'

export default function DocumentDrift() {
    const { id, commit } = useParams<{ id: string; commit: string }>()
    const [drift, setDrift] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            if (!id || !commit) return
            try {
                const res = await documentsApi.getDrift(id, commit)
                setDrift(res.data?.drift || {})
            } catch (err) {
                console.warn('Drift report not found:', err)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [id, commit])

    if (isLoading) return <div className="cr-loading"><div className="cr-spinner" /></div>

    const issues = drift?.statistics?.total_issues || 0

    const getSeverityLabel = (severity: string) => {
        const sev = String(severity || '').toUpperCase()
        if (sev === 'MAJOR' || sev === 'HIGH') return 'High'
        if (sev === 'MINOR' || sev === 'MEDIUM') return 'Medium'
        if (sev === 'CRITICAL') return 'Critical'
        return 'Low'
    }

    const getSeverityClass = (severity: string) => {
        const sev = String(severity || '').toLowerCase()
        if (sev === 'critical') return 'critical'
        if (sev === 'major' || sev === 'high') return 'high'
        if (sev === 'minor' || sev === 'medium') return 'medium'
        return 'low'
    }

    return (
        <div className="cr-page" style={{ overflowY: 'auto', padding: '24px 32px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Status Hero Card */}
                <DocCard bodyStyle={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    {issues > 0 ? (
                        <>
                            <ShieldAlert size={56} color="var(--severity-high)" style={{ marginBottom: '16px', filter: 'drop-shadow(0 0 10px var(--severity-high-glow))' }} />
                            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Drift Detected</h3>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', fontSize: '14px', lineHeight: 1.5 }}>
                                Our automated background scans detected <strong>{issues}</strong> discrepancy{issues === 1 ? '' : 'ies'} between your codebase components and the generated documentation.
                            </p>
                        </>
                    ) : (
                        <>
                            <CheckCircle size={56} color="var(--severity-low)" style={{ marginBottom: '16px', filter: 'drop-shadow(0 0 10px var(--severity-low-glow))' }} />
                            <h3 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>Architecture is in sync</h3>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', fontSize: '14px', lineHeight: 1.5 }}>
                                Excellent work! The generated snapshots are perfectly aligned with all active controllers, services, database models, and API interfaces.
                            </p>
                        </>
                    )}
                </DocCard>

                {/* Findings List */}
                {issues > 0 && drift?.findings && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <AlertCircle size={16} color="var(--text-muted)" />
                            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Drift Findings</h4>
                            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: 'var(--bg-subtle)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                {issues} issue{issues === 1 ? '' : 's'}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {drift.findings.map((f: any, i: number) => {
                                const sevClass = getSeverityClass(f.severity)
                                const borderStyle = `4px solid var(--severity-${sevClass})`
                                return (
                                    <DocCard key={i} style={{ borderLeft: borderStyle }} bodyStyle={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <div style={{ width: '100%' }}>
                                            {/* Header Row */}
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{
                                                        fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
                                                        background: `var(--severity-${sevClass}-glow)`, color: `var(--severity-${sevClass})`,
                                                        textTransform: 'uppercase', letterSpacing: '0.05em'
                                                    }}>
                                                        {f.type || 'DRIFT'}
                                                    </span>
                                                    <span style={{
                                                        fontSize: '11px', fontWeight: 500, padding: '2px 8px', borderRadius: '4px',
                                                        background: 'var(--bg-subtle)', color: 'var(--text-muted)', fontFamily: 'monospace'
                                                    }}>
                                                        {f.file}
                                                    </span>
                                                </div>
                                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                                    Severity: <strong style={{ color: `var(--severity-${sevClass})` }}>{getSeverityLabel(f.severity)}</strong>
                                                </span>
                                            </div>

                                            {/* Description */}
                                            <p style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.5, fontWeight: 500 }}>
                                                {f.description}
                                            </p>

                                            {/* Narrative Section Cards */}
                                            <div className="cr-grid-2" style={{ gap: '16px', marginTop: '12px' }}>
                                                <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '6px', minWidth: 0 }}>
                                                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                                                        What Changed
                                                    </span>
                                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                                                        {f.what_changed || 'New code components have been created or structural interfaces modified.'}
                                                    </p>
                                                </div>

                                                <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '6px', minWidth: 0 }}>
                                                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                                                        Why It Matters
                                                    </span>
                                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                                                        {f.why_it_matters || "Developers won't see the latest endpoints or schemas, increasing integration friction."}
                                                    </p>
                                                </div>
                                            </div>

                                            <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: '6px', minWidth: 0, marginTop: '16px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                                                    Recommended Fix
                                                </span>
                                                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                                                    {f.recommended_fix || 'Run a clean compilation to refresh target snapshots and restore parity.'}
                                                </p>
                                            </div>
                                        </div>
                                    </DocCard>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
