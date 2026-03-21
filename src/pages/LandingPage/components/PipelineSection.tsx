import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    GitBranch, Search, FileText, BarChart3,
    CheckCircle2, Zap
} from 'lucide-react'

interface PipelineNode {
    id: string
    label: string
    sublabel: string
    icon: React.ReactNode
    color: string
    files: string[]
}

const pipelineNodes: PipelineNode[] = [
    {
        id: 'repo', label: 'Repository', sublabel: 'Source code input',
        icon: <GitBranch size={20} />, color: 'var(--accent-blue)',
        files: ['src/', 'package.json', '.github/workflows/'],
    },
    {
        id: 'analysis', label: 'Code Analysis', sublabel: 'AST parsing & extraction',
        icon: <Search size={20} />, color: 'var(--accent-purple)',
        files: ['impact_report.json', 'doc_snapshot.json'],
    },
    {
        id: 'docs', label: 'Doc Generation', sublabel: 'Artifact creation',
        icon: <FileText size={20} />, color: 'var(--accent-green)',
        files: ['README.generated.md', 'system.mmd', 'api-reference.md', 'ADR-001.md'],
    },
    {
        id: 'intelligence', label: 'Intelligence', sublabel: 'Health & drift analysis',
        icon: <BarChart3 size={20} />, color: 'var(--accent-orange)',
        files: ['documentation-health.md', 'drift_report.json', 'summary.md'],
    },
]

export default function PipelineSection() {
    const [activeNode, setActiveNode] = useState<string | null>(null)
    const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set())

    useEffect(() => {
        const nodes = ['repo', 'analysis', 'docs', 'intelligence']
        nodes.forEach((node, i) => {
            setTimeout(() => {
                setCompletedNodes(prev => new Set([...prev, node]))
            }, 1000 + i * 600)
        })
    }, [])

    const handleNodeHover = useCallback((id: string | null) => {
        setActiveNode(id)
    }, [])

    return (
        <section id="pipeline" className="lp-section">
            <hr className="lp-divider" />

            <div className="lp-container" style={{ paddingTop: 40 }}>
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="lp-section-header"
                >
                    <span className="lp-badge">
                        <Zap size={13} style={{ color: 'var(--accent-blue)' }} />
                        Interactive Pipeline
                    </span>
                    <h2 className="lp-section-title" style={{ marginTop: 16 }}>
                        CI Documentation Pipeline
                    </h2>
                    <p className="lp-section-subtitle">
                        Every commit triggers an intelligent documentation flow — from code analysis to architecture intelligence.
                    </p>
                </motion.div>

                {/* Pipeline cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                >
                    <div className="lp-grid-4">
                        {pipelineNodes.map((node, i) => (
                            <motion.div
                                key={node.id}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.1 }}
                                className="lp-feature-card lp-pipeline-step"
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => handleNodeHover(node.id)}
                                onMouseLeave={() => handleNodeHover(null)}
                            >
                                {/* Step header */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                                    <div
                                        className="lp-feature-icon"
                                        style={{
                                            background: `color-mix(in srgb, ${node.color} 12%, transparent)`,
                                            color: node.color, marginBottom: 0,
                                        }}
                                    >
                                        {node.icon}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span className="lp-pipeline-step-num">Step {i + 1}</span>
                                        {completedNodes.has(node.id) && (
                                            <CheckCircle2 size={14} style={{ color: 'var(--accent-green)' }} />
                                        )}
                                    </div>
                                </div>

                                <div className="lp-feature-title">{node.label}</div>
                                <div className="lp-feature-desc">{node.sublabel}</div>

                                {/* Generated files */}
                                <AnimatePresence>
                                    {activeNode === node.id && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="lp-pipeline-files"
                                        >
                                            {node.files.map((file, fi) => (
                                                <motion.div
                                                    key={file}
                                                    initial={{ opacity: 0, x: -8 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: fi * 0.04 }}
                                                    className="lp-pipeline-file"
                                                >
                                                    <FileText size={10} style={{ color: 'var(--text-muted)' }} />
                                                    {file}
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>

                    {/* Status bar */}
                    <div className="lp-pipeline-status">
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="lp-status-dot" />
                            Pipeline Active
                        </span>
                        <span>4 stages completed</span>
                        <span>12 artifacts generated</span>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
