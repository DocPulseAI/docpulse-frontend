import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import DashboardLayout from '../components/DashboardLayout'
import { dashboardApi, DashboardCommit } from '../services/api'
import {
    FileText, ChevronRight, Shield,
    CheckCircle, XCircle, Info, Clock,
} from 'lucide-react'

export default function CommitAnalysis() {
    const [searchParams] = useSearchParams()
    const [commits, setCommits] = useState<DashboardCommit[]>([])
    const [selected, setSelected] = useState<DashboardCommit | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true)
                const response = await dashboardApi.getCommits({
                    projectId: searchParams.get('projectId') || undefined,
                    branch: searchParams.get('branch') || undefined,
                    dateFrom: searchParams.get('dateFrom') || undefined,
                    dateTo: searchParams.get('dateTo') || undefined,
                })
                const rows = response.data.commits || []
                setCommits(rows)
                const targetSha = (searchParams.get('sha') || '').toLowerCase()
                const preselected = rows.find((r) => r.sha.toLowerCase() === targetSha)
                setSelected(preselected || rows[0] || null)
                setError(null)
            } catch (e: any) {
                setError(e?.response?.data?.detail || 'Failed to load commits')
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [searchParams])

    return (
        <DashboardLayout>
            <div className="cr-page cr-page--flush">
                <div className="cr-page-header--border">
                    <div>
                        <h1 className="cr-page-title">Commit Analysis</h1>
                        <p className="cr-page-subtitle">AI-powered review of recent commits</p>
                    </div>
                </div>
                <div className="cr-two-panel">
                    {/* Left: Commit list — 35% */}
                    <div className="cr-panel-left" style={{ width: '35%', minWidth: 280, maxWidth: 420 }}>
                        <div className="cr-panel-header-sticky">
                            <span className="cr-panel-header-text">Commits</span>
                            <span className="cr-panel-header-sha">{commits.length} total</span>
                        </div>
                        <div className="cr-panel-scroll">
                            {isLoading && <div className="cr-list-empty">Loading commits...</div>}
                            {!isLoading && error && <div className="cr-list-empty">{error}</div>}
                            {!isLoading && !error && commits.length === 0 && <div className="cr-list-empty">No commits found</div>}
                            {commits.map((c) => (
                                <button
                                    key={c.sha}
                                    className={`cr-commit-row ${selected?.sha === c.sha ? 'cr-commit-row--active' : ''}`}
                                    onClick={() => setSelected(c)}
                                >
                                    <div className="cr-commit-row-top">
                                        <span className="cr-commit-sha">{c.sha}</span>
                                        <span className={`cr-severity cr-severity--${c.risk}`}>{c.risk}</span>
                                    </div>
                                    <p className="cr-commit-msg">{c.message}</p>
                                    <div className="cr-commit-row-meta">
                                        <span>{c.author}</span>
                                        <span><Clock size={10} /> {c.date}</span>
                                    </div>
                                    <div className="cr-file-list">
                                        {c.files.map((f) => (
                                            <div key={f.name} className="cr-file-item">
                                                <FileText size={12} />
                                                <span className="cr-file-name">{f.name}</span>
                                                <span className={`cr-severity cr-severity--${f.severity}`}>{f.severity}</span>
                                                <span className="cr-file-changes">+{f.changes}</span>
                                            </div>
                                        ))}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Analysis — 65% */}
                    <div className="cr-panel-right" style={{ flex: 1 }}>
                        <div className="cr-panel-header-sticky">
                            <Shield size={14} />
                            <span className="cr-panel-header-text">Analysis</span>
                            <span className="cr-panel-header-sha">{selected?.sha || '--'}</span>
                        </div>
                        <div className="cr-panel-scroll">
                            {!selected && (
                                <div className="cr-list-empty">Select a commit to view analysis</div>
                            )}
                            {selected && (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selected.sha}
                                    className="cr-analysis"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -4 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    {/* Summary */}
                                    <div className="cr-analysis-card">
                                        <div className="cr-analysis-card-header">
                                            <Info size={14} />
                                            <h4>Summary</h4>
                                        </div>
                                        <p className="cr-analysis-text">{selected.summary}</p>
                                    </div>

                                    {/* Impact */}
                                    <div className="cr-analysis-card">
                                        <div className="cr-analysis-card-header">
                                            <ChevronRight size={14} />
                                            <h4>Impact Assessment</h4>
                                            <span className={`cr-severity cr-severity--${selected.risk}`}>{selected.risk}</span>
                                        </div>
                                        <p className="cr-analysis-text">{selected.impact}</p>
                                    </div>

                                    {/* Breaking Change */}
                                    {selected.breaking && (
                                        <div className="cr-analysis-card cr-analysis-card--danger">
                                            <div className="cr-analysis-card-header">
                                                <XCircle size={14} />
                                                <h4>Breaking Change</h4>
                                            </div>
                                            <p className="cr-analysis-text">{selected.breakingDetails}</p>
                                        </div>
                                    )}

                                    {!selected.breaking && (
                                        <div className="cr-analysis-card cr-analysis-card--success">
                                            <div className="cr-analysis-card-header">
                                                <CheckCircle size={14} />
                                                <h4>No Breaking Changes</h4>
                                            </div>
                                            <p className="cr-analysis-text">This commit is backward-compatible.</p>
                                        </div>
                                    )}

                                    {/* Recommendations */}
                                    <div className="cr-analysis-card">
                                        <div className="cr-analysis-card-header">
                                            <Shield size={14} />
                                            <h4>Recommendations</h4>
                                        </div>
                                        <ul className="cr-analysis-list">
                                            {selected.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                                        </ul>
                                    </div>

                                    {/* Files Changed */}
                                    <div className="cr-analysis-card">
                                        <div className="cr-analysis-card-header">
                                            <FileText size={14} />
                                            <h4>Files Changed ({selected.files.length})</h4>
                                        </div>
                                        <div className="cr-analysis-files">
                                            {selected.files.map((f) => (
                                                <div key={f.name} className="cr-analysis-file-row">
                                                    <FileText size={12} style={{ color: 'var(--text-muted)' }} />
                                                    <span className="cr-analysis-file-name">{f.name}</span>
                                                    <span className={`cr-severity cr-severity--${f.severity}`}>{f.severity}</span>
                                                    <span className="cr-analysis-file-diff">+{f.changes}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
