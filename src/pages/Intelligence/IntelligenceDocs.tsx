import React, { useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, FileText, Download, ChevronRight } from 'lucide-react'
import { portalApi, PortalDoc } from '../../services/portalApi'
import { intelligenceApi } from '../../services/api'
import MarkdownRenderer from '../../components/MarkdownRenderer'
import './IntelligencePages.css'

const DOC_ICONS: Record<string, string> = {
    readme: '📄', 'api-ref': '🌐', health: '🏥', summary: '🤖', adr: '📐', default: '📝'
}

const IntelligenceDocs: React.FC = () => {
    const { projectId, commitHash } = useOutletContext<{ projectId: string; commitHash: string }>()
    const [docs, setDocs] = useState<PortalDoc[]>([])
    const [selected, setSelected] = useState<PortalDoc | null>(null)
    const [content, setContent] = useState<string | null>(null)
    const [loadingList, setLoadingList] = useState(true)
    const [loadingContent, setLoadingContent] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!projectId || !commitHash) return
        setLoadingList(true)
        portalApi.getDocs(projectId, commitHash)
            .then(r => {
                setDocs(r.data.docs)
                if (r.data.docs.length > 0) loadDoc(r.data.docs[0])
            })
            .catch(e => setError(e.message))
            .finally(() => setLoadingList(false))
    }, [projectId, commitHash])

    const loadDoc = async (doc: PortalDoc) => {
        setSelected(doc)
        setContent(null)
        setLoadingContent(true)
        try {
            const res = await intelligenceApi.getDocs(projectId, commitHash, doc.path)
            setContent(typeof res.data === 'string' ? res.data : JSON.stringify(res.data, null, 2))
        } catch {
            setContent('_Failed to load this document._')
        } finally {
            setLoadingContent(false)
        }
    }

    const handleDownload = () => {
        if (!content || !selected) return
        const blob = new Blob([content], { type: 'text/markdown' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = selected.name.replace(/ /g, '_') + '.md'
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="intel-page">
            <div className="intel-page-header">
                <h1 className="intel-page-title">
                    <span className="intel-page-title-icon" style={{ background: '#f0f9ff', color: '#0ea5e9' }}>
                        <BookOpen size={18} />
                    </span>
                    Documentation
                </h1>
                <p className="intel-page-subtitle">Auto-generated docs for commit {commitHash?.slice(0, 7)}</p>
            </div>

            {loadingList ? (
                <div className="intel-loading-skeleton" style={{ height: 400, borderRadius: 14 }} />
            ) : error || docs.length === 0 ? (
                <div className="intel-section-card">
                    <div className="intel-empty">
                        <BookOpen size={36} className="text-slate-300" />
                        <p>{error ?? 'No documentation available for this commit.'}</p>
                    </div>
                </div>
            ) : (
                <div className="intel-arch-layout">
                    {/* Doc navigator */}
                    <div className="intel-arch-sidebar">
                        <div className="intel-arch-sidebar-header">
                            <FileText size={14} />
                            <span>{docs.length} Doc{docs.length !== 1 ? 's' : ''}</span>
                        </div>
                        {docs.map((d, i) => (
                            <button
                                key={i}
                                onClick={() => loadDoc(d)}
                                className={`intel-arch-file-btn ${selected?.path === d.path ? 'intel-arch-file-btn--active' : ''}`}
                            >
                                <span className="intel-arch-file-icon">{DOC_ICONS[d.type] ?? DOC_ICONS.default}</span>
                                <span className="intel-arch-file-name">{d.name}</span>
                                <ChevronRight size={12} className="intel-arch-file-arrow" />
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="intel-arch-canvas">
                        <motion.div
                            key={selected?.path ?? 'none'}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="intel-section-card intel-arch-diagram-card"
                        >
                            {selected && (
                                <div className="intel-section-card-header">
                                    <div>
                                        <h3 className="intel-section-card-title">
                                            {DOC_ICONS[selected.type] ?? DOC_ICONS.default} {selected.name}
                                        </h3>
                                        <p className="intel-section-card-sub">{selected.path}</p>
                                    </div>
                                    <button onClick={handleDownload} className="intel-docs-download-btn">
                                        <Download size={14} /> Download
                                    </button>
                                </div>
                            )}
                            <div className="intel-section-card-body intel-docs-content">
                                {loadingContent ? (
                                    <div className="intel-loading-skeleton" style={{ height: 400 }} />
                                ) : content ? (
                                    <MarkdownRenderer content={content} />
                                ) : (
                                    <div className="intel-empty">Select a document to view it.</div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default IntelligenceDocs
