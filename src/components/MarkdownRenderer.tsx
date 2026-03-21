import { useEffect, useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import mermaid from 'mermaid'
import { useTheme } from '../context/ThemeContext'
import { ZoomIn, ZoomOut, Maximize2, Minimize2, Image as ImageIcon } from 'lucide-react'

// ── Mermaid config util ──
function getMermaidConfig(isDark: boolean) {
    return {
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        securityLevel: 'loose',
        fontFamily: "'Inter', 'JetBrains Mono', ui-monospace, monospace",
        fontSize: 13,
        themeVariables: isDark ? {
            darkMode: true,
            background: 'transparent',
            primaryColor: '#1e293b',
            primaryTextColor: '#f8fafc',
            primaryBorderColor: '#334155',
            secondaryColor: '#334155',
            secondaryTextColor: '#f8fafc',
            tertiaryColor: '#0f172a',
            tertiaryTextColor: '#f8fafc',
            lineColor: '#64748b',
            textColor: '#f8fafc',
            mainBkg: '#1e293b',
            nodeBorder: '#475569',
            clusterBkg: '#0f172a',
            clusterBorder: '#334155',
            edgeLabelBackground: '#0f172a',
            defaultLinkColor: '#94a3b8',
            titleColor: '#f1f5f9',
            sectionBkgColor: '#1e293b',
            sectionTextColor: '#f8fafc',
        } : {
            darkMode: false,
            background: 'transparent',
            primaryColor: '#ffffff',
            primaryTextColor: '#1e293b',
            primaryBorderColor: '#e2e8f0',
            secondaryColor: '#f8fafc',
            secondaryTextColor: '#1e293b',
            tertiaryColor: '#f1f5f9',
            tertiaryTextColor: '#1e293b',
            lineColor: '#94a3b8',
            textColor: '#1e293b',
            mainBkg: '#ffffff',
            nodeBorder: '#cbd5e1',
            clusterBkg: '#f8fafc',
            clusterBorder: '#e2e8f0',
            edgeLabelBackground: '#ffffff',
            defaultLinkColor: '#64748b',
            titleColor: '#0f172a',
            sectionBkgColor: '#f8fafc',
            sectionTextColor: '#1e293b',
        },
    }
}

/** Renders a mermaid diagram from code string */
const MERMAID_ROOT_PATTERN = /^(?:sequenceDiagram|erDiagram|classDiagram(?:-v2)?|stateDiagram(?:-v2)?|journey|gantt|pie|mindmap|timeline|gitGraph|flowchart\b|graph\b|quadrantChart|requirementDiagram|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment|xychart-beta|sankey-beta|block-beta|packet-beta|architecture-beta)\b/

const splitMermaidDiagrams = (code: string): string[] => {
    const lines = code.split('\n')
    const chunks: string[] = []
    let current: string[] = []

    const pushCurrent = () => {
        const joined = current.join('\n').trim()
        if (joined) chunks.push(joined)
        current = []
    }

    for (const line of lines) {
        const trimmed = line.trim()
        if (MERMAID_ROOT_PATTERN.test(trimmed) && current.some(part => part.trim().length > 0)) {
            pushCurrent()
        }
        current.push(line)
    }

    pushCurrent()
    return chunks.length > 0 ? chunks : [code.trim()].filter(Boolean)
}

const normalizeMermaid = (diagram: string): string =>
    diagram
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(line => line.trimEnd())
        .join('\n')
        .trim()

const dedupeMermaidDiagrams = (diagrams: string[]): string[] => {
    const seen = new Set<string>()
    const unique: string[] = []
    for (const diagram of diagrams) {
        const normalized = normalizeMermaid(diagram)
        if (!normalized || seen.has(normalized)) continue
        seen.add(normalized)
        unique.push(diagram)
    }
    return unique
}

const mermaidDiagramTitle = (diagram: string, index: number, total: number): string => {
    const first = diagram.split('\n').map(line => line.trim()).find(Boolean)?.toLowerCase() || ''
    let label = 'Diagram'
    if (first.startsWith('erdiagram')) label = 'ER Diagram'
    else if (first.startsWith('sequencediagram')) label = 'Sequence Diagram'
    else if (first.startsWith('flowchart') || first.startsWith('graph')) label = 'Flow Diagram'
    else if (first.startsWith('classdiagram')) label = 'Class Diagram'
    else if (first.startsWith('statediagram')) label = 'State Diagram'
    return total > 1 ? `${label} ${index + 1}` : label
}

function MermaidDiagram({ code }: { code: string }) {
    const { theme } = useTheme()
    const isDark = theme === 'dark'
    const [svg, setSvg] = useState('')
    const [error, setError] = useState('')
    const [zoom, setZoom] = useState(1)
    const [isFullscreen, setIsFullscreen] = useState(false)

    // Generate a stable ID for this block to avoid re-rendering issues
    const diagramId = useMemo(() => `mmd-${Math.floor(Math.random() * 1000000)}`, [])

    const firstLine = code.split('\n').map(l => l.trim()).find(Boolean)?.toLowerCase() || ''
    const title = firstLine.startsWith('erdiagram') ? 'ER Diagram'
        : firstLine.startsWith('sequencediagram') ? 'Sequence Diagram'
            : 'Architecture Diagram'

    useEffect(() => {
        let asyncCancelled = false
        const renderDiagram = async () => {
            try {
                // Always re-initialize with current theme before rendering
                mermaid.initialize(getMermaidConfig(isDark))
                const { svg: rendered } = await mermaid.render(diagramId, code)
                if (!asyncCancelled) {
                    setSvg(rendered)
                    setError('')
                }
            } catch (err) {
                console.error('Mermaid render failed:', err)
                if (!asyncCancelled) {
                    setSvg('')
                    setError('Failed to render diagram.')
                }
            }
        }
        renderDiagram()
        return () => { asyncCancelled = true }
    }, [code, isDark, diagramId])

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3))
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5))
    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
        setZoom(1)
    }

    return (
        <div className={`doc-mermaid-wrapper ${isFullscreen ? 'is-fullscreen' : ''}`}>
            <div className="doc-mermaid-header">
                <div className="doc-mermaid-title">
                    <ImageIcon size={12} />
                    {title}
                </div>
                <div className="doc-mermaid-controls">
                    <button onClick={handleZoomOut} className="doc-mermaid-control-btn" title="Zoom Out"><ZoomOut size={14} /></button>
                    <button onClick={() => setZoom(1)} className="doc-mermaid-control-btn" style={{ fontSize: '10px', width: 'auto', padding: '0 4px' }}>{Math.round(zoom * 100)}%</button>
                    <button onClick={handleZoomIn} className="doc-mermaid-control-btn" title="Zoom In"><ZoomIn size={14} /></button>
                    <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)', margin: '0 4px' }} />
                    <button onClick={toggleFullscreen} className="doc-mermaid-control-btn" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                        {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>
                </div>
            </div>

            <div className="doc-mermaid-viewport" style={{ maxHeight: isFullscreen ? 'none' : '500px' }}>
                {svg ? (
                    <div
                        className="doc-mermaid-svg-container"
                        style={{ transform: `scale(${zoom})` }}
                        dangerouslySetInnerHTML={{ __html: svg }}
                    />
                ) : (
                    <div className="doc-mermaid-container" style={{ border: 'none', margin: 0 }}>
                        {error && <p className="doc-mermaid-error">{error}</p>}
                        <pre className="doc-mermaid-raw">{code}</pre>
                    </div>
                )}
            </div>
        </div>
    )
}

export function MermaidBlock({ code }: { code: string }) {
    const splitDiagrams = useMemo(() => splitMermaidDiagrams(code), [code])
    const diagrams = useMemo(() => dedupeMermaidDiagrams(splitDiagrams), [splitDiagrams])
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        setActiveIndex(0)
    }, [code, diagrams.length])

    if (diagrams.length <= 1) {
        return <MermaidDiagram code={diagrams[0] || code} />
    }

    const duplicateCount = Math.max(0, splitDiagrams.length - diagrams.length)
    const safeIndex = Math.min(activeIndex, diagrams.length - 1)

    return (
        <div className="doc-mermaid-stack">
            <div className="doc-mermaid-tabs">
                {diagrams.map((diagram, index) => (
                    <button
                        key={`${index}-${diagram.slice(0, 32)}`}
                        type="button"
                        className={`doc-mermaid-tab ${index === safeIndex ? 'is-active' : ''}`}
                        onClick={() => setActiveIndex(index)}
                    >
                        {mermaidDiagramTitle(diagram, index, diagrams.length)}
                    </button>
                ))}
                {duplicateCount > 0 && (
                    <span className="doc-mermaid-duplicate-note">
                        {duplicateCount} duplicate {duplicateCount === 1 ? 'diagram' : 'diagrams'} hidden
                    </span>
                )}
            </div>

            <MermaidDiagram code={diagrams[safeIndex]} />
        </div>
    )
}

interface MarkdownRendererProps {
    content: string
    onLineClick?: (lineNumber: number) => void
}

/**
 * Production markdown renderer with GFM, raw HTML, and Mermaid support.
 * Max reading width ~720px centered, proper typography hierarchy.
 */
export default function MarkdownRenderer({ content, onLineClick }: MarkdownRendererProps) {
    return (
        <div className="doc-md-reader" onClick={e => {
            if (!onLineClick) return
            const target = e.target as HTMLElement
            const lineEl = target.closest('[data-line]')
            if (lineEl) onLineClick(Number(lineEl.getAttribute('data-line')))
        }}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    code: ({ inline, className, children, ...props }: any) => {
                        const raw = String(children ?? '').replace(/\n$/, '')
                        const langMatch = /language-([\w-]+)/.exec(className || '')
                        const lang = (langMatch?.[1] || '').toLowerCase()
                        if (!inline && (lang === 'mermaid' || lang === 'mmd')) return <MermaidBlock code={raw} />
                        if (!inline) {
                            return (
                                <pre className="doc-md-codeblock">
                                    <code className={className} {...props}>{children}</code>
                                </pre>
                            )
                        }
                        return <code className={className} {...props}>{children}</code>
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
