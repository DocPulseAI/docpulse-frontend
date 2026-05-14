import React, { useEffect, useState } from 'react'

import { motion } from 'framer-motion'
import { Workflow, FileCode, ChevronRight, Copy, Check } from 'lucide-react'
import { portalApi, PortalArchFile } from '../services/portalApi'
import { MermaidBlock } from '../components/MarkdownRenderer'

interface Props {
    projectId: string;
    commitHash: string;
}

const CallGraphViewer: React.FC<Props> = ({ projectId, commitHash }) => {
    const [files, setFiles] = useState<PortalArchFile[]>([])
    const [selected, setSelected] = useState<PortalArchFile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        if (!selected) return
        const code = selected.content.replace(/^```mermaid\n?/, '').replace(/\n?```$/, '')
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    useEffect(() => {
        if (!projectId || !commitHash) return
        setLoading(true)
        portalApi.getCallFlow(projectId, commitHash)
            .then(r => {
                setFiles(r.data.files)
                if (r.data.files.length > 0) setSelected(r.data.files[0])
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [projectId, commitHash])

    if (loading) return (
        <div className="cr-card">
            <div className="cr-loading" style={{ height: 400 }}><div className="cr-spinner" /></div>
        </div>
    )

    if (error || files.length === 0) return (
        <div className="cr-card">
            <div className="cr-doc-empty">
                <Workflow size={36} className="text-slate-300" style={{ opacity: 0.5, marginBottom: 12 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{error ?? 'No call flow diagrams available for this commit.'}</p>
            </div>
        </div>
    )

    return (
        <div className="cr-card" style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
            <div className="cr-card-header" style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-default)' }}>
                <h3 className="cr-card-title">Call Flow Sequences</h3>
            </div>
            
            <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
                {/* File list sidebar */}
                <div style={{ width: 220, borderRight: '1px solid var(--border-default)', background: 'var(--bg-subtle)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '12px 16px', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid var(--border-default)' }}>
                        <FileCode size={14} />
                        <span>{files.length} Flow{files.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ overflowY: 'auto', flex: 1 }}>
                        {files.map((f, i) => (
                            <button
                                key={i}
                                onClick={() => setSelected(f)}
                                style={{
                                    width: '100%', padding: '10px 16px', textAlign: 'left', border: 'none', background: selected?.path === f.path ? 'var(--bg-default)' : 'transparent',
                                    borderLeft: selected?.path === f.path ? '3px solid var(--accent-primary)' : '3px solid transparent',
                                    cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    borderBottom: '1px solid var(--border-default)'
                                }}
                            >
                                <span style={{ fontSize: 13, color: selected?.path === f.path ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: selected?.path === f.path ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {f.name}
                                </span>
                                {selected?.path === f.path && <ChevronRight size={14} color="var(--accent-primary)" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Diagram canvas */}
                <div style={{ flex: 1, padding: 24, background: 'var(--bg-default)', overflow: 'auto' }}>
                    {selected && (
                        <motion.div
                            key={selected.path}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>{selected.name}</h3>
                                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-mono)' }}>{selected.path}</p>
                                </div>
                                <button onClick={handleCopy} className="cr-doc-btn">
                                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    {copied ? 'Copied!' : 'Copy Code'}
                                </button>
                            </div>
                            <div style={{ background: '#fff', padding: 20, borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-default)' }}>
                                <MermaidBlock code={selected.content.replace(/^```mermaid\n?/, '').replace(/\n?```$/, '')} />
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CallGraphViewer
