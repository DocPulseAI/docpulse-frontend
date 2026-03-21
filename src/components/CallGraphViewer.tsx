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
import { Workflow } from 'lucide-react'

interface CallGraphViewerProps {
    projectId: string
    commitHash: string
    onNodeClick?: (label: string) => void
}

const CallGraphViewer: React.FC<CallGraphViewerProps> = ({ projectId, commitHash, onNodeClick }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [loading, setLoading] = useState(true)
    const [analysisUnavailable, setAnalysisUnavailable] = useState(false)

    useEffect(() => {
        const fetchCallGraph = async () => {
            if (!projectId || !commitHash) return
            setLoading(true)
            try {
                const response = await intelligenceApi.getCallGraph(projectId, commitHash)
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

                const processedNodes = graphNodes.map((nodeId: string, index: number) => ({
                    id: nodeId,
                    data: { label: nodeId },
                    position: {
                        x: (index % 4) * 260,
                        y: Math.floor(index / 4) * 110,
                    },
                    style: {
                        background: 'var(--bg-default)',
                        color: 'var(--text-primary)',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        width: 220,
                    },
                }))

                const processedEdges = graphEdges.map((edge: any, index: number) => ({
                    id: `call-edge-${index}`,
                    source: edge.from,
                    target: edge.to,
                    animated: true,
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

        fetchCallGraph()
    }, [projectId, commitHash, setEdges, setNodes])

    if (loading) {
        return <div className="intel-empty-state intel-graph-height">Loading call graph...</div>
    }

    if (analysisUnavailable) {
        return <div className="intel-empty-state intel-graph-height">Analysis not available for this commit.</div>
    }

    if (nodes.length === 0) {
        return <div className="intel-empty-state intel-graph-height">No call graph data available for this commit.</div>
    }

    return (
        <div className="intel-graph-stack">
            <div className="intel-graph-toolbar">
                <div className="intel-legend-row">
                    <span className="intel-chip"><Workflow size={12} /> Nodes {nodes.length}</span>
                    <span className="intel-chip">Edges {edges.length}</span>
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
        </div>
    )
}

export default CallGraphViewer
