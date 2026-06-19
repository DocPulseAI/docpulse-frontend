import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { documentsApi, ArchitectureFile } from '../../services/api'
import MarkdownRenderer, { MermaidBlock } from '../../components/MarkdownRenderer'
import { AlertTriangle, FileText, Code2, PieChart as PieChartIcon } from 'lucide-react'
import { getImpactStats } from '../../utils/documentPayloads'

function fileIcon(name: string) {
    if (name === 'Interactive Graph') return <PieChartIcon size={13} />
    const lower = name.toLowerCase()
    if (lower.endsWith('.mmd') || lower.endsWith('.mermaid')) return <Code2 size={13} />
    return <FileText size={13} />
}

function fileLabel(name: string) {
    if (name === 'Interactive Graph') return 'Interactive Graph'
    const base = name.split('/').pop() || name
    return base
        .replace(/\.(mmd|mermaid|md|markdown)$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
}

import DocCard from '../../components/DocCard'

function FileRenderer({ file }: { file: ArchitectureFile }) {
    const { id, commit } = useParams<{ id: string; commit: string }>()

    if (file.name === 'Interactive Graph') {
        const stats = file.content as any
        const severityData = stats ? [
            { name: 'MAJOR', value: stats.severity?.MAJOR || 0, color: 'var(--severity-high)' },
            { name: 'MINOR', value: stats.severity?.MINOR || 0, color: 'var(--severity-medium)' },
            { name: 'PATCH', value: stats.severity?.PATCH || 0, color: 'var(--severity-low)' }
        ].filter(d => d.value > 0) : []

        return (
            <div className="cr-page" style={{ padding: '0 32px' }}>
                <div className="cr-grid-2" style={{ paddingTop: '24px' }}>
                    <DocCard title="Severity Distribution via Recharts" bodyStyle={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {severityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </DocCard>

                    <DocCard title="Affected Modules & Files">
                        <div style={{ marginBottom: '16px' }}>
                            <h4 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Modules</h4>
                            {stats?.modules?.length > 0 ? stats.modules.map((m: string) => (
                                <div key={m} style={{ fontSize: '13px', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>{m}</div>
                            )) : <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No affected modules detected.</div>}
                        </div>
                        <div>
                            <h4 style={{ fontSize: '14px', marginBottom: '8px', color: 'var(--text-secondary)' }}>Files</h4>
                            {stats?.files?.length > 0 ? stats.files.map((f: string) => (
                                <div key={f} style={{ fontSize: '13px', padding: '4px 0', color: 'var(--text-muted)' }}>{f}</div>
                            )) : <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No individual files modified.</div>}
                        </div>
                    </DocCard>
                </div>
            </div>
        )
    }

    const lower = file.name.toLowerCase()
    const isMermaid = lower.endsWith('.mmd') || lower.endsWith('.mermaid')
    return (
        <div style={{ padding: '24px 32px' }}>
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
                paddingBottom: 12, borderBottom: '1px solid var(--border-subtle)'
            }}>
                <span style={{ color: 'var(--accent-primary)' }}>{fileIcon(file.name)}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {fileLabel(file.name)}
                </span>
                <span style={{
                    marginLeft: 'auto', fontSize: 10, padding: '2px 6px',
                    borderRadius: 4, background: 'var(--bg-subtle)',
                    color: 'var(--text-muted)', fontFamily: 'monospace'
                }}>
                    {file.name.split('/').pop()}
                </span>
            </div>
            {isMermaid ? (
                <MermaidBlock code={typeof file.content === 'string' ? file.content : ''} />
            ) : (
                <div className="portal-markdown cr-markdown-small">
                    <MarkdownRenderer content={typeof file.content === 'string' ? file.content : ''} />
                </div>
            )}
        </div>
    )
}

export default function DocumentImpact() {
    const { id, commit } = useParams<{ id: string; commit: string }>()
    const [files, setFiles] = useState<ArchitectureFile[]>([])
    const [selected, setSelected] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            if (!id || !commit) return
            setIsLoading(true)
            try {
                // 1. Fetch JSON stats for Pie Chart
                let impactStats: any = null
                try {
                    const impactRes = await documentsApi.getImpactReport(id, commit)
                    impactStats = getImpactStats(impactRes.data)
                } catch (e) {
                    console.warn('Recharts JSON data not found or invalid', e)
                }

                // 2. Fetch markdown/mermaid files from new dedicated backend route
                let fetchedFiles: ArchitectureFile[] = []
                try {
                    const res = await documentsApi.getImpact(id, commit)
                    fetchedFiles = res.data.files || []
                } catch (err) {
                    console.warn('Backend documents fetch failed', err)
                }

                if (impactStats) {
                    fetchedFiles.push({
                        name: 'Interactive Graph',
                        content: impactStats as any,
                        lastModified: new Date().toISOString()
                    })
                }

                const sorted = [...fetchedFiles].sort((a, b) => {
                    if (a.name === 'Interactive Graph') return -1
                    if (b.name === 'Interactive Graph') return 1
                    const aIsDoc = a.name.toLowerCase().endsWith('.md')
                    const bIsDoc = b.name.toLowerCase().endsWith('.md')
                    if (aIsDoc && !bIsDoc) return -1
                    if (!aIsDoc && bIsDoc) return 1
                    return a.name.localeCompare(b.name)
                })

                setFiles(sorted)
                if (sorted.length > 0) setSelected(sorted[0].name)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [id, commit])

    if (isLoading) return <div className="cr-loading"><div className="cr-spinner" /></div>

    if (files.length === 0) {
        return (
            <div className="cr-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, color: 'var(--text-muted)' }}>
                <AlertTriangle size={40} style={{ opacity: 0.3 }} />
                <p style={{ fontSize: 14 }}>Impact documentation not available.</p>
            </div>
        )
    }

    const activeFile = files.find(f => f.name === selected)

    if (files.length === 1 && activeFile) {
        return (
            <div className="cr-page" style={{ padding: '0', overflow: 'auto' }}>
                <FileRenderer file={activeFile} />
            </div>
        )
    }

    return (
        <div className="cr-two-panel">
            {/* Sidebar */}
            <div className="cr-panel-left" style={{ width: 240, borderRight: '1px solid var(--border-subtle)' }}>
                <div className="cr-panel-header-sticky" style={{ paddingBottom: 8 }}>
                    <AlertTriangle size={13} className="cr-text-muted" />
                    <span className="cr-panel-header-text">Impact Files</span>
                    <span style={{
                        marginLeft: 'auto', fontSize: 10, padding: '1px 6px',
                        borderRadius: 10, background: 'var(--bg-subtle)', color: 'var(--text-muted)'
                    }}>{files.length}</span>
                </div>
                <div className="cr-panel-scroll">
                    {files.map(f => (
                        <button key={f.name}
                            className={`cr-commit-row ${selected === f.name ? 'cr-commit-row--active' : ''}`}
                            onClick={() => setSelected(f.name)}
                            style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                            <span style={{ color: f.name === 'Interactive Graph' ? 'var(--accent-purple)' : (f.name.toLowerCase().endsWith('.md') ? 'var(--text-muted)' : 'var(--accent-primary)'), flexShrink: 0 }}>
                                {f.name === 'Interactive Graph' ? <PieChartIcon size={13} /> : fileIcon(f.name)}
                            </span>
                            <span className="cr-commit-msg" style={{ fontSize: 12 }}>{fileLabel(f.name)}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="cr-panel-right" style={{ overflow: 'auto' }}>
                {activeFile ? (
                    <FileRenderer file={activeFile} />
                ) : (
                    <div className="cr-list-empty">Select a file from the sidebar.</div>
                )}
            </div>
        </div>
    )
}
