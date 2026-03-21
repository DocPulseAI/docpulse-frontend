import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FolderOpen, FileText, ChevronRight, ChevronDown,
    X, Clock, Code2, FolderTree
} from 'lucide-react'

interface FileNode {
    name: string
    type: 'file' | 'folder'
    children?: FileNode[]
    extension?: string
    updated?: string
    content?: string
}

const fileTree: FileNode[] = [
    {
        name: 'README.generated.md', type: 'file', extension: 'md', updated: '2 min ago',
        content: `# CI Living Documentation Platform\n\n## Overview\nAutomated documentation generation for modern engineering teams.\n\n## Architecture\nThe platform uses a multi-stage CI pipeline:\n1. **Code Analysis** — AST parsing and feature extraction\n2. **Impact Detection** — Change diff analysis\n3. **Doc Generation** — Automated artifact creation\n4. **Intelligence** — Drift detection & health scoring\n\n## Quick Start\n\`\`\`bash\nnpm install @docpulse/cli\ndocpulse init\ndocpulse connect <repo-url>\n\`\`\``,
    },
    {
        name: 'documentation-health.md', type: 'file', extension: 'md', updated: '5 min ago',
        content: `# Documentation Health Report\n\n| Metric | Score | Status |\n|--------|-------|--------|\n| Coverage | 97% | ✅ |\n| Freshness | 92% | ✅ |\n| Accuracy | 95% | ✅ |\n| Overall | 94/100 | ✅ |\n\n## Drift Alerts\n- ⚠️ api-reference.md: STALE_ENDPOINT\n- ℹ️ system.mmd: minor schema drift`,
    },
    {
        name: 'tree.txt', type: 'file', extension: 'txt', updated: '2 min ago',
        content: `.\n├── README.generated.md\n├── documentation-health.md\n├── tree.txt\n├── api/\n│   ├── api-reference.md\n│   └── api-description.json\n├── architecture/\n│   ├── system.mmd\n│   ├── sequence.mmd\n│   ├── er.mmd\n│   └── architecture.md\n├── adr/\n│   └── ADR-001.md\n├── doc_snapshot.json\n└── summary/\n    ├── summary.md\n    └── summary.json`,
    },
    {
        name: 'api', type: 'folder',
        children: [
            {
                name: 'api-reference.md', type: 'file', extension: 'md', updated: '10 min ago',
                content: `# API Reference\n\n## Endpoints\n\n### POST /api/v1/analyze\nTrigger code analysis for a repository.\n\n### GET /api/v1/health\nReturns service health status.\n\n### GET /api/v1/artifacts/{project_id}\nRetrieve generated documentation artifacts.`
            },
            {
                name: 'api-description.json', type: 'file', extension: 'json', updated: '10 min ago',
                content: `openapi: 3.0.3\ninfo:\n  title: DocPulse AI API\n  version: 2.4.1`
            },
        ],
    },
    {
        name: 'architecture', type: 'folder',
        children: [
            {
                name: 'system.mmd', type: 'file', extension: 'mmd', updated: '3 min ago',
                content: `graph TD\n    A[GitHub Webhook] --> B[CI Orchestrator]\n    B --> C[Code Analyzer]\n    B --> D[Doc Generator]`
            },
            {
                name: 'architecture.md', type: 'file', extension: 'md', updated: '5 min ago',
                content: `# Architecture Overview\n\n## System Components\n\n### Epic 1: Code Analysis Engine\nParses repository AST and extracts features.`
            },
        ],
    },
    {
        name: 'summary', type: 'folder',
        children: [
            {
                name: 'summary.md', type: 'file', extension: 'md', updated: '2 min ago',
                content: `# Change Summary — v2.4.1\n\n## Changes\n- Updated API reference\n- Regenerated architecture diagram\n- Added ADR-001`
            },
            {
                name: 'summary.json', type: 'file', extension: 'json', updated: '2 min ago',
                content: `{\n  "version": "2.4.1",\n  "changes": 3,\n  "health_score": 94\n}`
            },
        ],
    },
]

const activityFeed = [
    { file: 'README.generated.md', action: 'updated', time: '2 min ago', color: 'var(--accent-green)' },
    { file: 'system.mmd', action: 'regenerated', time: '3 min ago', color: 'var(--accent-blue)' },
    { file: 'ADR-001.md', action: 'created', time: '5 min ago', color: 'var(--accent-purple)' },
    { file: 'drift_report.json', action: 'generated', time: '5 min ago', color: 'var(--accent-orange)' },
    { file: 'summary.md', action: 'updated', time: '6 min ago', color: 'var(--accent-blue)' },
]

function getFileColor(ext?: string) {
    switch (ext) {
        case 'md': return 'var(--accent-blue)'
        case 'json': return 'var(--accent-orange)'
        case 'yaml': return 'var(--accent-green)'
        case 'mmd': return 'var(--accent-purple)'
        default: return 'var(--text-muted)'
    }
}

function FileTreeItem({ node, depth = 0, onSelect }: { node: FileNode; depth?: number; onSelect: (n: FileNode) => void }) {
    const [expanded, setExpanded] = useState(depth < 1)

    if (node.type === 'folder') {
        return (
            <div>
                <div
                    className="lp-file-tree-item"
                    style={{ paddingLeft: `${depth * 16 + 8}px` }}
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    <FolderOpen size={14} style={{ color: 'var(--accent-blue)', opacity: 0.7 }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{node.name}/</span>
                </div>
                <AnimatePresence>
                    {expanded && node.children && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.15 }}>
                            {node.children.map(c => <FileTreeItem key={c.name} node={c} depth={depth + 1} onSelect={onSelect} />)}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        )
    }

    return (
        <div
            className="lp-file-tree-item"
            style={{ paddingLeft: `${depth * 16 + 24}px` }}
            onClick={() => onSelect(node)}
        >
            <FileText size={13} style={{ color: getFileColor(node.extension) }} />
            <span style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{node.name}</span>
        </div>
    )
}

function PreviewModal({ file, onClose }: { file: FileNode; onClose: () => void }) {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="lp-preview-overlay" onClick={onClose}>
            <motion.div initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.97 }} transition={{ duration: 0.2 }}
                className="lp-preview-modal" onClick={e => e.stopPropagation()}>
                <div className="lp-preview-modal-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileText size={14} style={{ color: getFileColor(file.extension) }} />
                        <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text-primary)' }}>{file.name}</span>
                        <span style={{
                            fontSize: 10, fontFamily: 'var(--font-mono)',
                            padding: '1px 6px', borderRadius: 4,
                            background: 'var(--bg-subtle)', color: 'var(--text-muted)',
                            border: '1px solid var(--border-muted)'
                        }}>
                            {file.extension || 'text'}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {file.updated && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: 'var(--text-muted)' }}>
                                <Clock size={10} /> {file.updated}
                            </span>
                        )}
                        <button onClick={onClose} style={{
                            width: 24, height: 24, borderRadius: 4,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'transparent', border: 'none',
                            color: 'var(--text-muted)', cursor: 'pointer'
                        }}>
                            <X size={14} />
                        </button>
                    </div>
                </div>
                <div className="lp-preview-modal-body">
                    <pre>{file.content}</pre>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default function ArtifactShowcase() {
    const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
    const [visibleActivities, setVisibleActivities] = useState(0)

    useEffect(() => {
        activityFeed.forEach((_, i) => {
            setTimeout(() => setVisibleActivities(prev => Math.max(prev, i + 1)), 500 + i * 350)
        })
    }, [])

    return (
        <section id="artifacts" className="lp-section">
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
                        <Code2 size={13} style={{ color: 'var(--accent-blue)' }} />
                        Generated Artifacts
                    </span>
                    <h2 className="lp-section-title" style={{ marginTop: 16 }}>
                        Live Documentation Artifacts
                    </h2>
                    <p className="lp-section-subtitle">
                        Explore the documentation artifacts generated automatically from your codebase — click any file to preview.
                    </p>
                </motion.div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
                    <div className="lp-grid-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
                        {/* File explorer */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="lp-card"
                            style={{ overflow: 'hidden' }}
                        >
                            <div className="lp-card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <FolderTree size={14} style={{ color: 'var(--text-muted)' }} />
                                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                        docs/
                                    </span>
                                </div>
                                <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                                    generated moments ago
                                </span>
                            </div>
                            <div style={{ padding: 8 }}>
                                {fileTree.map(node => <FileTreeItem key={node.name} node={node} onSelect={setSelectedFile} />)}
                            </div>
                        </motion.div>

                        {/* Activity feed */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="lp-card"
                            style={{ overflow: 'hidden' }}
                        >
                            <div className="lp-card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                                    <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--text-secondary)' }}>
                                        Activity
                                    </span>
                                </div>
                            </div>
                            <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {activityFeed.slice(0, visibleActivities).map((activity, i) => (
                                    <motion.div
                                        key={`${activity.file}-${i}`}
                                        initial={{ opacity: 0, x: 8 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="lp-activity-item"
                                    >
                                        <div className="lp-activity-dot" style={{ background: activity.color }} />
                                        <div>
                                            <div className="lp-activity-file">
                                                <span style={{ color: activity.color }}>{activity.file}</span>
                                                <span style={{ color: 'var(--text-muted)' }}> {activity.action}</span>
                                            </div>
                                            <span className="lp-activity-time">{activity.time}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                            <div style={{
                                padding: '8px 14px', textAlign: 'center',
                                borderTop: '1px solid var(--border-muted)',
                            }}>
                                <span style={{
                                    fontSize: 10, fontFamily: 'var(--font-mono)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                    color: 'var(--text-muted)',
                                }}>
                                    <span className="lp-status-dot" />
                                    Watching for changes...
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedFile && selectedFile.type === 'file' && (
                    <PreviewModal file={selectedFile} onClose={() => setSelectedFile(null)} />
                )}
            </AnimatePresence>
        </section>
    )
}
