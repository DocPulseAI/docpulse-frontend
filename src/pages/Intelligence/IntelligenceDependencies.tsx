import React, { useEffect, useState, useCallback } from 'react'
import { useOutletContext } from 'react-router-dom'
import { motion } from 'framer-motion'
import { GitFork, AlertTriangle, Search } from 'lucide-react'
import dagre from 'dagre'
import ReactFlow, {
    useNodesState, useEdgesState, MarkerType, Background, Controls,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { portalApi, PortalDeps } from '../../services/portalApi'


const CYCLE_COLORS = ['#ef4444', '#f97316', '#8b5cf6', '#06b6d4']

const IntelligenceDependencies: React.FC = () => {
    const { projectId, commitHash } = useOutletContext<{ projectId: string; commitHash: string }>()
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
        <div className="intel-page">
            <div className="intel-loading-skeleton" style={{ height: 80, borderRadius: 14, marginBottom: 16 }} />
            <div className="intel-loading-skeleton" style={{ height: 500, borderRadius: 14 }} />
        </div>
    )

    return (
        <div className="intel-page">
            <div className="intel-page-header">
                <h1 className="intel-page-title">
                    <span className="intel-page-title-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                        <GitFork size={18} />
                    </span>
                    Dependencies
                </h1>
                <p className="intel-page-subtitle">Module coupling analysis and circular dependency detection</p>
            </div>

            {/* ── Circular Dep Alert ── */}
            {data && data.circularDependencies.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="intel-cycle-alert"
                >
                    <div className="intel-cycle-alert-header">
                        <AlertTriangle size={16} />
                        <span className="intel-cycle-alert-title">
                            {data.circularDependencies.length} Circular Dependenc{data.circularDependencies.length > 1 ? 'ies' : 'y'} Detected
                        </span>
                        <span className="intel-cycle-alert-sub">
                            These create tight coupling that makes code hard to test and refactor
                        </span>
                    </div>
                    <div className="intel-cycle-list">
                        {data.circularDependencies.map((cycle, i) => (
                            <div key={i} className="intel-cycle-item">
                                <span className="intel-cycle-dot" style={{ background: CYCLE_COLORS[i % CYCLE_COLORS.length] }} />
                                <code className="intel-cycle-chain">
                                    {[...cycle, cycle[0]].join(' → ')}
                                </code>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* ── Stats chips ── */}
            {data && (
                <div className="intel-deps-stats">
                    <span className="intel-chip">
                        <GitFork size={11} /> {data.totalModules} Modules
                    </span>
                    <span className="intel-chip">
                        {data.totalDependencies} Dependencies
                    </span>
                    {data.circularDependencies.length > 0 && (
                        <span className="intel-chip intel-chip--red">
                            ⚠️ {data.circularDependencies.length} Cycle{data.circularDependencies.length > 1 ? 's' : ''}
                        </span>
                    )}
                    {data.truncated && (
                        <span className="intel-chip intel-chip--yellow">
                            Showing top {data.modules.length} of {data.totalModules}
                        </span>
                    )}
                </div>
            )}

            {/* ── Graph ── */}
            {error || !data ? (
                <div className="intel-section-card">
                    <div className="intel-empty">
                        <GitFork size={36} className="text-slate-300" />
                        <p>{error ?? 'No dependency data available for this commit.'}</p>
                    </div>
                </div>
            ) : (
                <div className="intel-section-card" style={{ marginTop: 16 }}>
                    <div className="intel-section-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h3 className="intel-section-card-title">Module Dependency Graph</h3>
                            <p className="intel-section-card-sub">
                                Red nodes and edges = circular dependencies &nbsp;·&nbsp; Drag to explore
                            </p>
                        </div>
                        <div className="intel-api-search-wrap" style={{ width: 250 }}>
                            <Search size={14} className="intel-api-search-icon" />
                            <input 
                                type="text"
                                placeholder="Search modules..."
                                className="intel-api-search"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div style={{ height: 520 }}>
                        <ReactFlow
                            nodes={nodes} edges={edges}
                            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
                            fitView fitViewOptions={{ padding: 0.15 }}
                            minZoom={0.2} maxZoom={2}
                        >
                            <Background color="#f1f5f9" gap={20} />
                            <Controls />
                        </ReactFlow>
                    </div>
                </div>
            )}
        </div>
    )
}

export default IntelligenceDependencies
