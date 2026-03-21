import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Activity, Shield, TrendingUp, AlertTriangle,
    CheckCircle2, Clock, FileText, GitCommit
} from 'lucide-react'

const timeline = [
    { version: 'v2.4.1', time: '2 min ago', changes: 3, status: 'success' as const },
    { version: 'v2.4.0', time: '1 hour ago', changes: 7, status: 'success' as const },
    { version: 'v2.3.9', time: '3 hours ago', changes: 2, status: 'warning' as const },
    { version: 'v2.3.8', time: '6 hours ago', changes: 5, status: 'success' as const },
    { version: 'v2.3.7', time: '1 day ago', changes: 4, status: 'success' as const },
]

const driftAlerts = [
    { file: 'api-reference.md', type: 'STALE_ENDPOINT', severity: 'high' as const },
    { file: 'system.mmd', type: 'SCHEMA_DRIFT', severity: 'medium' as const },
    { file: 'README.generated.md', type: 'OUTDATED_SECTION', severity: 'low' as const },
]

export default function DashboardSection() {
    const [healthScore, setHealthScore] = useState(0)
    const targetScore = 94
    const [visibleAlerts, setVisibleAlerts] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setHealthScore(prev => {
                if (prev >= targetScore) { clearInterval(interval); return targetScore }
                return prev + 1
            })
        }, 25)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        driftAlerts.forEach((_, i) => {
            setTimeout(() => setVisibleAlerts(prev => Math.max(prev, i + 1)), 600 + i * 400)
        })
    }, [])

    const severityStyles = {
        high: { bg: 'var(--severity-critical-glow, rgba(248, 81, 73, 0.05))', border: 'var(--severity-critical-glow, rgba(248, 81, 73, 0.15))', color: 'var(--severity-critical, var(--accent-red))', label: 'High' },
        medium: { bg: 'var(--severity-medium-glow, rgba(210, 153, 34, 0.05))', border: 'var(--severity-medium-glow, rgba(210, 153, 34, 0.15))', color: 'var(--severity-medium, var(--accent-orange))', label: 'Med' },
        low: { bg: 'var(--bg-subtle)', border: 'var(--border-muted)', color: 'var(--text-muted)', label: 'Low' },
    }

    return (
        <section id="dashboard" className="lp-section">
            <hr className="lp-divider" />

            <div className="lp-container" style={{ paddingTop: 40 }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="lp-section-header"
                >
                    <span className="lp-badge">
                        <Activity size={13} style={{ color: 'var(--accent-green)' }} />
                        Live Dashboard
                    </span>
                    <h2 className="lp-section-title" style={{ marginTop: 16 }}>
                        Documentation Intelligence
                    </h2>
                    <p className="lp-section-subtitle">
                        Real-time health monitoring, drift detection, and version intelligence for your engineering docs.
                    </p>
                </motion.div>

                <div className="lp-dashboard-grid">
                    {/* Health Score */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="lp-card"
                    >
                        <div className="lp-card-body">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Documentation Health</span>
                                <Shield size={16} style={{ color: 'var(--accent-green)' }} />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 14 }}>
                                <span
                                    className="lp-health-score"
                                    style={{
                                        color: healthScore >= 90 ? 'var(--accent-green)' : healthScore >= 70 ? 'var(--accent-orange)' : 'var(--accent-red)',
                                    }}
                                >
                                    {healthScore}
                                </span>
                                <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>/100</span>
                            </div>

                            <div className="lp-health-bar">
                                <div
                                    className="lp-health-bar-fill"
                                    style={{ width: `${healthScore}%`, background: 'var(--accent-green)' }}
                                />
                            </div>

                            <div className="lp-metric-grid">
                                {[
                                    { label: 'Coverage', value: '97%', color: 'var(--accent-green)' },
                                    { label: 'Freshness', value: '92%', color: 'var(--accent-blue)' },
                                    { label: 'Accuracy', value: '95%', color: 'var(--accent-purple)' },
                                ].map(({ label, value, color }) => (
                                    <div key={label} className="lp-metric-box">
                                        <div className="lp-metric-value" style={{ color }}>{value}</div>
                                        <div className="lp-metric-label">{label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Version Timeline */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="lp-card"
                    >
                        <div className="lp-card-body">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Version Timeline</span>
                                <TrendingUp size={16} style={{ color: 'var(--accent-purple)' }} />
                            </div>

                            {timeline.map((entry, i) => (
                                <div
                                    key={entry.version}
                                    className="lp-timeline-item"
                                    style={{ background: i === 0 ? 'var(--bg-subtle)' : 'transparent' }}
                                >
                                    <GitCommit size={14} style={{
                                        color: entry.status === 'success' ? 'var(--accent-green)' : 'var(--accent-orange)',
                                    }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span className="lp-timeline-version">{entry.version}</span>
                                            {i === 0 && <span className="lp-latest-badge">LATEST</span>}
                                        </div>
                                        <span className="lp-timeline-meta">
                                            {entry.changes} artifacts · {entry.time}
                                        </span>
                                    </div>
                                    <CheckCircle2 size={14} style={{ color: 'var(--accent-green)', opacity: 0.4 }} />
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Drift Alerts */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="lp-card"
                    >
                        <div className="lp-card-body">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Drift Detection</span>
                                <AlertTriangle size={16} style={{ color: 'var(--accent-orange)' }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {driftAlerts.slice(0, visibleAlerts).map((alert) => {
                                    const style = severityStyles[alert.severity]
                                    return (
                                        <motion.div
                                            key={alert.file}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="lp-severity-card"
                                            style={{ background: style.bg, border: `1px solid ${style.border}` }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                <FileText size={12} style={{ color: style.color }} />
                                                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text-primary)' }}>
                                                    {alert.file}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{alert.type}</span>
                                                <span
                                                    className="lp-severity-label"
                                                    style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
                                                >
                                                    {style.label}
                                                </span>
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>

                            <div style={{
                                marginTop: 14, paddingTop: 12,
                                borderTop: '1px solid var(--border-muted)',
                                display: 'flex', alignItems: 'center', gap: 6,
                                fontSize: 11, color: 'var(--text-muted)'
                            }}>
                                <Clock size={12} />
                                Last scan: 2 minutes ago
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
