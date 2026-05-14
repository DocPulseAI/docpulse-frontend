import React, { useEffect, useState, useCallback } from 'react'

import { motion } from 'framer-motion'
import { GitFork, AlertTriangle, Search } from 'lucide-react'
import dagre from 'dagre'
import ReactFlow, {
    useNodesState, useEdgesState, MarkerType, Background, Controls,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { portalApi, PortalDeps } from '../services/portalApi'


const CYCLE_COLORS = ['#ef4444', '#f97316', '#8b5cf6', '#06b6d4']

interface Props {
    projectId: string;
    commitHash: string;
}

const DependencyGraphViewer: React.FC<Props> = ({ projectId, commitHash }) => {
    const [data, setData] = useState<PortalDeps | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        if (!projectId || !commitHash) return
        setLoading(true)
        portalApi.getDependencies(projectId, commitHash)
            .then(r => {
                if ((r.data as any).status === 'analysis_not_available') {
                    setData(null)
                    return
                }
                setData(r.data)
                buildGraph(r.data)
            })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false))
    }, [projectId, commitHash])

    const buildGraph = useCallback((dep: PortalDeps) => {
        const cycleModules = new Set(dep.circularDependencies.flat())
        const moduleList = dep.modules ?? []

        const cycleEdgePairs = new Set(
            dep.circularDependencies.flatMap(cycle =>
                cycle.map((m, i) => `${m}->${cycle[(i + 1) % cycle.length]}`)
            )
        )

        const dagreGraph = new dagre.graphlib.Graph()
        dagreGraph.setDefaultEdgeLabel(() => ({}))
        dagreGraph.setGraph({ rankdir: 'LR', nodesep: 40, ranksep: 100 })

        const rawNodes = moduleList.map((mod) => ({
            id: mod,
            data: { label: mod.split('/').pop() ?? mod },
            position: { x: 0, y: 0 },
            style: {
                background: cycleModules.has(mod) ? '#fef2f2' : '#f8fafc',
                border: cycleModules.has(mod) ? '2px solid #ef4444' : '1px solid #e2e8f0',
                borderRadius: 8,
                padding: '6px 10px',
                fontSize: 11,
                color: cycleModules.has(mod) ? '#dc2626' : '#334155',
                width: 180,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                transition: 'opacity 0.2s',
            }
        }))

        const rawEdges = dep.dependencies.map((e, i) => {
            const isCyclic = cycleEdgePairs.has(`${e.from}->${e.to}`)
            return {
                id: `dep-${i}`,
                source: e.from,
                target: e.to,
                markerEnd: { type: MarkerType.ArrowClosed, color: isCyclic ? '#ef4444' : '#94a3b8' },
                style: { stroke: isCyclic ? '#ef4444' : '#cbd5e1', strokeWidth: isCyclic ? 2 : 1, transition: 'opacity 0.2s' },
                animated: isCyclic,
            }
        })

        rawNodes.forEach((n: any) => dagreGraph.setNode(n.id, { width: 180, height: 40 }))
        rawEdges.forEach((e: any) => dagreGraph.setEdge(e.source, e.target))

        dagre.layout(dagreGraph)

        const processedNodes = rawNodes.map((node: any) => {
            const nodeWithPosition = dagreGraph.node(node.id)
            return {
                ...node,
                targetPosition: 'left' as any,
                sourcePosition: 'right' as any,
                position: {
                    x: nodeWithPosition.x - 90,
                    y: nodeWithPosition.y - 20,
                }
            }
        })

        setNodes(processedNodes)
        setEdges(rawEdges)
    }, [setNodes, setEdges])

    useEffect(() => {
        if (!data) return
        const s = search.toLowerCase()
        const matchedModules = new Set(data.modules.filter(m => (m.split('/').pop() ?? m).toLowerCase().includes(s)))
        
        setNodes(nds => nds.map(n => {
            const isMatch = !s || matchedModules.has(n.id)
            return { ...n, style: { ...n.style, opacity: isMatch ? 1 : 0.2 } }
        }))
        setEdges(eds => eds.map(e => {
            const isMatch = !s || matchedModules.has(e.source) || matchedModules.has(e.target)
            return { ...e, style: { ...e.style, opacity: isMatch ? 1 : 0.1 } }
        }))
    }, [search, data, setNodes, setEdges])

    if (loading) return (
        <div className="cr-card">
            <div className="cr-loading" style={{ height: 400 }}><div className="cr-spinner" /></div>
        </div>
    )

    return (
        <div className="cr-stack">
            {/* ── Circular Dep Alert ── */}
            {data && data.circularDependencies.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'var(--severity-critical-glow)', border: '1px solid var(--severity-critical)', borderRadius: 'var(--radius-lg)', padding: 16 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--severity-critical)', marginBottom: 12 }}>
                        <AlertTriangle size={16} />
                        <span style={{ fontWeight: 600, fontSize: 13 }}>
                            {data.circularDependencies.length} Circular Dependenc{data.circularDependencies.length > 1 ? 'ies' : 'y'} Detected
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                            These create tight coupling that makes code hard to test and refactor
                        </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {data.circularDependencies.map((cycle, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{ width: 8, height: 8, borderRadius: 4, background: CYCLE_COLORS[i % CYCLE_COLORS.length] }} />
                                <code style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--severity-critical)', background: 'var(--bg-subtle)', padding: '4px 8px', borderRadius: 4 }}>
                                    {[...cycle, cycle[0]].join(' → ')}
                                </code>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* ── Graph ── */}
            {error || !data ? (
                <div className="cr-card">
                    <div className="cr-doc-empty">
                        <GitFork size={36} className="text-slate-300" style={{ opacity: 0.5, marginBottom: 12 }} />
                        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{error ?? 'No dependency data available for this commit.'}</p>
                    </div>
                </div>
            ) : (
                <div className="cr-card" style={{ height: 600, display: 'flex', flexDirection: 'column' }}>
                    <div className="cr-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-default)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <h3 className="cr-card-title">Module Dependency Graph</h3>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <span className="cr-severity cr-severity--info" style={{ fontSize: 10 }}>{data.totalModules} Modules</span>
                                <span className="cr-severity cr-severity--info" style={{ fontSize: 10 }}>{data.totalDependencies} Dependencies</span>
                                {data.circularDependencies.length > 0 && <span className="cr-severity cr-severity--critical" style={{ fontSize: 10 }}>{data.circularDependencies.length} Cycles</span>}
                            </div>
                        </div>
                        <div style={{ position: 'relative', width: 250 }}>
                            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input 
                                type="text"
                                placeholder="Search modules..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ width: '100%', padding: '6px 10px 6px 30px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', background: 'var(--bg-subtle)', color: 'var(--text-primary)', fontSize: 12, outline: 'none' }}
                            />
                        </div>
                    </div>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <ReactFlow
                            nodes={nodes} edges={edges}
                            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                            fitView fitViewOptions={{ padding: 0.15 }}
                            minZoom={0.2} maxZoom={2}
                        >
                            <Background color="var(--border-default)" gap={20} />
                            <Controls style={{ background: 'var(--bg-default)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)' }} />
                        </ReactFlow>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DependencyGraphViewer
