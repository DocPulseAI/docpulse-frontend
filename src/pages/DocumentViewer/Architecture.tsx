import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import 'reactflow/dist/style.css'
import { documentsApi, ArchitectureFile } from '../../services/api'
import MarkdownRenderer, { MermaidBlock } from '../../components/MarkdownRenderer'
import { Layers, FileText, Code2, AlertTriangle } from 'lucide-react'
import { getArchitectureReconstruction } from '../../utils/documentPayloads'

function isDiagram(file: ArchitectureFile) {
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    return ['mmd', 'mermaid'].includes(ext)
}

function fileIcon(name: string) {
    if (name === 'Interactive Graph') return <Layers size={13} />
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

function normalizeDiagramContent(content: unknown): string {
    if (typeof content !== 'string') return ''
    return content.replace(/\r\n/g, '\n').trim()
}

function dedupeArchitectureFiles(items: ArchitectureFile[]): ArchitectureFile[] {
    const seenDiagrams = new Set<string>()
    const seenOtherFiles = new Set<string>()
    const unique: ArchitectureFile[] = []

    for (const item of items) {
        if (item.name === 'Interactive Graph') {
            unique.push(item)
            continue
        }

        if (isDiagram(item)) {
            const diagramKey = normalizeDiagramContent(item.content)
            const signature = diagramKey || item.name.toLowerCase()
            if (seenDiagrams.has(signature)) continue
            seenDiagrams.add(signature)
            unique.push(item)
            continue
        }

        const fileKey = item.name.toLowerCase()
        if (seenOtherFiles.has(fileKey)) continue
        seenOtherFiles.add(fileKey)
        unique.push(item)
    }

    return unique
}

import InteractiveGraph from '../../components/InteractiveGraph'

function FileRenderer({ file }: { file: ArchitectureFile }) {
    if (file.name === 'Interactive Graph') {
        return (
            <div style={{ width: '100%', height: 'calc(100vh - 64px)' }} className="cr-page cr-page--flush">
                <InteractiveGraph data={file.content as any} type="architecture" />
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

export default function DocumentArchitecture() {
    const { id, commit } = useParams<{ id: string; commit: string }>()
    const [files, setFiles] = useState<ArchitectureFile[]>([])
    const [selected, setSelected] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            if (!id || !commit) return
            setIsLoading(true)
            try {
                // 1. Fetch ReactFlow data
                let reactFlowData: any = null
                try {
                    const impactRes = await documentsApi.getImpactReport(id, commit)
                    reactFlowData = getArchitectureReconstruction(impactRes.data)
                } catch (e) {
                    console.warn('ReactFlow data fetch failed', e)
                }

                // 2. Fetch markdown/mermaid files from new dedicated backend route
                let fetchedFiles: ArchitectureFile[] = []
                try {
                    const res = await documentsApi.getArchitecture(id, commit)
                    fetchedFiles = (res.data.files || []).filter((f: ArchitectureFile) => {
                        const name = f.name.toLowerCase()
                        // Filter out files that are usually better served by other specialized tabs
                        if (name.includes('dependency') && name.endsWith('.mmd')) return false
                        if (name.includes('impact') && name.endsWith('.json')) return false
                        return true
                    })
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

                const deduped = dedupeArchitectureFiles(fetchedFiles)

                const sorted = [...deduped].sort((a, b) => {
                    if (a.name === 'Interactive Graph') return -1
                    if (b.name === 'Interactive Graph') return 1
                    const aIsDiag = isDiagram(a)
                    const bIsDiag = isDiagram(b)
                    if (aIsDiag && !bIsDiag) return 1
                    if (!aIsDiag && bIsDiag) return -1
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
                <p style={{ fontSize: 14 }}>Documentation files not available.</p>
            </div>
        )
    }

    const activeFile = files.find(f => f.name === selected)
    const renderSidebarGroup = (title: string, icon: React.ReactNode, filterFn: (f: ArchitectureFile) => boolean) => {
        const groupFiles = files.filter(filterFn)
        if (groupFiles.length === 0) return null
        return (
            <div style={{ marginBottom: 16 }}>
                <div className="cr-panel-header-sticky" style={{ paddingBottom: 8, paddingTop: 8 }}>
                    {icon}
                    <span className="cr-panel-header-text">{title}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, padding: '1px 6px', borderRadius: 10, background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>{groupFiles.length}</span>
                </div>
                {groupFiles.map(f => (
                    <button key={f.name}
                        className={`cr-commit-row ${selected === f.name ? 'cr-commit-row--active' : ''}`}
                        onClick={() => setSelected(f.name)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                        <span style={{ color: f.name === 'Interactive Graph' ? 'var(--accent-purple)' : (isDiagram(f) ? 'var(--text-primary)' : 'var(--text-muted)'), flexShrink: 0 }}>
                            {fileIcon(f.name)}
                        </span>
                        <span className="cr-commit-msg" style={{ fontSize: 12 }}>{fileLabel(f.name)}</span>
                    </button>
                ))}
            </div>
        )
    }

    return (
        <div className="cr-two-panel">
            <div className="cr-panel-left" style={{ width: 240, borderRight: '1px solid var(--border-subtle)' }}>
                <div className="cr-panel-scroll">
                    {renderSidebarGroup('Interactive', <Layers size={13} className="cr-text-muted" />, f => f.name === 'Interactive Graph')}
                    {renderSidebarGroup('Overviews', <FileText size={13} className="cr-text-muted" />, f => f.name !== 'Interactive Graph' && !isDiagram(f))}
                    {renderSidebarGroup('Diagrams', <Code2 size={13} className="cr-text-muted" />, f => f.name !== 'Interactive Graph' && isDiagram(f))}
                </div>
            </div>

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
