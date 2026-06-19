import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import 'reactflow/dist/style.css'
import { documentsApi, ArchitectureFile } from '../../services/api'
import MarkdownRenderer, { MermaidBlock } from '../../components/MarkdownRenderer'
import { Network, FileText, Code2, AlertTriangle } from 'lucide-react'
import { getArchitectureReconstruction } from '../../utils/documentPayloads'

function isDependencyFile(name: string) {
    if (name === 'Interactive Graph') return true
    const lower = name.toLowerCase()
    return lower.includes('dependency') || lower.includes('dependencies')
}

function fileIcon(name: string) {
    if (name === 'Interactive Graph') return <Network size={13} />
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

import DependencyGraphViewer from '../../components/DependencyGraphViewer'

function FileRenderer({ file }: { file: ArchitectureFile }) {
    const { id, commit } = useParams<{ id: string; commit: string }>()

    if (file.name === 'Interactive Graph') {
        return (
            <div style={{ width: '100%', height: 'calc(100vh - 64px)' }} className="cr-page cr-page--flush">
                <DependencyGraphViewer projectId={id!} commitHash={commit!} />
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

export default function DocumentDependencies() {
    const { id, commit } = useParams<{ id: string; commit: string }>()
    const [files, setFiles] = useState<ArchitectureFile[]>([])
    const [selected, setSelected] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            if (!id || !commit) return
            setIsLoading(true)
            try {
                // 1. Fetch JSON impact data for ReactFlow interactive graph
                let reactFlowData: any = null
                try {
                    const impactRes = await documentsApi.getImpactReport(id, commit)
                    reactFlowData = getArchitectureReconstruction(impactRes.data)
                } catch (e) {
                    console.warn('ReactFlow data not found or invalid', e)
                }

                // 2. Fetch new dedicated backend route for dependencies
                let fetchedFiles: ArchitectureFile[] = []
                try {
                    const res = await documentsApi.getDependencies(id, commit)
                    fetchedFiles = (res.data.files || []).filter(f => isDependencyFile(f.name))
                } catch (err) {
                    console.warn('Backend documents fetch failed', err)
                }

                if (reactFlowData && (reactFlowData.nodes?.length > 0 || reactFlowData.components?.length > 0)) {
                    fetchedFiles.push({
                        name: 'Interactive Graph',
                        content: reactFlowData as any,
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
                <p style={{ fontSize: 14 }}>Dependency files not available.</p>
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
                    <Network size={13} className="cr-text-muted" />
                    <span className="cr-panel-header-text">Dependency Trees</span>
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
                                {f.name === 'Interactive Graph' ? <Network size={13} /> : fileIcon(f.name)}
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
