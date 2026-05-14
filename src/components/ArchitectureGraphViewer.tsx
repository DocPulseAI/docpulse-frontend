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
import { Boxes } from 'lucide-react'

interface ArchitectureGraphViewerProps {
    projectId: string
    commitHash: string
    onNodeClick?: (label: string) => void
}

const typeColumn: Record<string, number> = {
    api: 0,
    controller: 1,
    service: 2,
    entity: 3,
    module: 4,
}

export const nodeTypeColor: Record<string, string> = {
    api: '#0ea5e9',
    controller: '#6366f1',
    service: '#10b981',
    entity: '#f59e0b',
    module: '#64748b',
}

const ArchitectureGraphViewer: React.FC<ArchitectureGraphViewerProps> = ({ projectId, commitHash, onNodeClick }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [loading, setLoading] = useState(true)
    const [analysisUnavailable, setAnalysisUnavailable] = useState(false)

    useEffect(() => {
        const fetchGraph = async () => {
            if (!projectId || !commitHash) return
            setLoading(true)
            try {
                const response = await intelligenceApi.getRepositoryGraph(projectId, commitHash)
                const data = response.data
                if (data?.status === 'analysis_not_available') {
                    setAnalysisUnavailable(true)
                    setNodes([])
                    setEdges([])
                    return
                }
                setAnalysisUnavailable(false)

                const graphNodes = Array.isArray(data?.nodes) ? data.nodes : []
                const graphEdges = Array.isArray(data?.edges) ? data.edges : []

                const typeIndexMap: Record<string, number> = {}
                const processedNodes = graphNodes.map((node: any) => {
                    const type = String(node.type || 'module')
                    const column = typeColumn[type] ?? 5
                    const rowIndex = typeIndexMap[type] || 0
                    typeIndexMap[type] = rowIndex + 1

                    return {
                        id: String(node.id),
                        data: { label: String(node.id) },
                        position: {
                            x: column * 260,
                            y: rowIndex * 105,
                        },
                        style: {
                            background: 'var(--bg-default)',
                            color: 'var(--text-primary)',
                            border: `2px solid ${nodeTypeColor[type] || '#64748b'}`,
                            borderRadius: '6px',
                            padding: '8px 10px',
                            width: 220,
                        },
                    }
                })

                const processedEdges = graphEdges.map((edge: any, index: number) => ({
                    id: `repo-edge-${index}`,
                    source: String(edge.from),
                    target: String(edge.to),
                    label: String(edge.type || ''),
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#475569',
                    },
                    style: {
                        stroke: '#64748b',
                    },
                    labelStyle: {
                        fill: '#334155',
                        fontSize: 11,
                    },
                }))

                setNodes(processedNodes)
                setEdges(processedEdges)
            } finally {
                setLoading(false)
            }
        }

        fetchGraph()
    }, [projectId, commitHash, setEdges, setNodes])

    if (loading) {
        return <div className="intel-empty-state intel-graph-height-lg">Loading architecture graph...</div>
    }

    if (analysisUnavailable) {
        return <div className="intel-empty-state intel-graph-height-lg">Analysis not available for this commit.</div>
    }

    if (nodes.length === 0) {
        return <div className="intel-empty-state intel-graph-height-lg">No architecture graph data available for this commit.</div>
    }

    return (
        <div className="intel-graph-stack">
            <div className="intel-graph-toolbar">
                <div className="intel-legend-row">
                    <span className="intel-chip"><Boxes size={12} /> Nodes {nodes.length}</span>
                    <span className="intel-chip">Edges {edges.length}</span>
                </div>
                <div className="intel-legend-row">
                    <span className="intel-legend-dot" style={{ background: nodeTypeColor.api }}>API</span>
                    <span className="intel-legend-dot" style={{ background: nodeTypeColor.controller }}>Controller</span>
                    <span className="intel-legend-dot" style={{ background: nodeTypeColor.service }}>Service</span>
                    <span className="intel-legend-dot" style={{ background: nodeTypeColor.entity }}>Entity</span>
                    <span className="intel-legend-dot" style={{ background: nodeTypeColor.module }}>Module</span>
                </div>
            </div>

            <div className="intel-graph-shell intel-graph-shell-lg">
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
        </div>
    )
}

export default ArchitectureGraphViewer
