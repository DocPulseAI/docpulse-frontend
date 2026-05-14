import React, { useEffect, useState } from 'react'
import ReactFlow, {
    Background,
    Controls,
    MarkerType,
    useEdgesState,
    useNodesState,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { intelligenceApi } from '../services/api'
import { GitFork } from 'lucide-react'

interface DependencyGraphViewerProps {
    projectId: string
    commitHash: string
    onNodeClick?: (label: string) => void
}

const DependencyGraphViewer: React.FC<DependencyGraphViewerProps> = ({ projectId, commitHash, onNodeClick }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [cycles, setCycles] = useState<string[][]>([])
    const [loading, setLoading] = useState(true)
    const [analysisUnavailable, setAnalysisUnavailable] = useState(false)

    useEffect(() => {
        const fetchDependencies = async () => {
            if (!projectId || !commitHash) return
            setLoading(true)
            try {
                const response = await intelligenceApi.getDependencies(projectId, commitHash)
                const data = response.data
                if (data?.status === 'analysis_not_available') {
                    setAnalysisUnavailable(true)
                    setNodes([])
                    setEdges([])
                    setCycles([])
                    return
                }
                setAnalysisUnavailable(false)

                const modules = Array.isArray(data?.modules) ? data.modules : []
                const dependencies = Array.isArray(data?.dependencies) ? data.dependencies : []
                const circular = Array.isArray(data?.circular_dependencies) ? data.circular_dependencies : []

                setCycles(circular)

                const processedNodes = modules.map((module: string, index: number) => ({
                    id: module,
                    data: { label: module },
                    position: {
                        x: (index % 5) * 190,
                        y: Math.floor(index / 5) * 95,
                    },
                    style: {
                        background: 'var(--bg-default)',
                        color: 'var(--text-primary)',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '8px 10px',
                    },
                }))

                const processedEdges = dependencies.map((edge: any, index: number) => ({
                    id: `dep-edge-${index}`,
                    source: edge.from,
                    target: edge.to,
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#64748b',
                    },
                    style: {
                        stroke: '#94a3b8',
                    },
                }))

                setNodes(processedNodes)
                setEdges(processedEdges)
            } finally {
                setLoading(false)
            }
        }

        fetchDependencies()
    }, [projectId, commitHash, setEdges, setNodes])

    if (loading) {
        return <div className="intel-empty-state intel-graph-height">Loading dependency graph...</div>
    }

    if (analysisUnavailable) {
        return <div className="intel-empty-state intel-graph-height">Analysis not available for this commit.</div>
    }

    if (nodes.length === 0) {
        return <div className="intel-empty-state intel-graph-height">No dependency data available for this commit.</div>
    }

    return (
        <div className="intel-graph-stack">
            <div className="intel-graph-toolbar">
                <div className="intel-legend-row">
                    <span className="intel-chip"><GitFork size={12} /> Modules {nodes.length}</span>
                    <span className="intel-chip">Dependencies {edges.length}</span>
                </div>
            </div>

            <div className="intel-graph-shell">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeClick={(_, node) => onNodeClick?.(node.data.label)}
                    fitView
                    fitViewOptions={{ padding: 0.2 }}
                    minZoom={0.3}
                    maxZoom={1.5}
                >
                    <Background color="#dbe3ec" gap={18} />
                    <Controls />
                </ReactFlow>
            </div>

            <div className="intel-cycles">
                <div className="intel-cycles-title">Circular Dependencies</div>
                {cycles.length === 0 ? (
                    <div className="intel-cycles-empty">No circular dependencies detected.</div>
                ) : (
                    <div className="intel-cycles-list">
                        {cycles.map((cycle, index) => (
                            <div key={`cycle-${index}`} className="intel-cycle-item">
                                {cycle.join(' -> ')}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default DependencyGraphViewer
