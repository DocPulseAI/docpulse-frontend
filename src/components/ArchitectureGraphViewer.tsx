import React, { useEffect, useState } from 'react'
import ReactFlow, {
    Background,
    Controls,
    MarkerType,
    useEdgesState,
    useNodesState,
    Node,
    Edge,
    Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'
import dagre from 'dagre'
import { intelligenceApi } from '../services/api'
import { Boxes, Search, X } from 'lucide-react'

interface ArchitectureGraphViewerProps {
    projectId: string
    commitHash: string
    onNodeClick?: (label: string) => void
}

export const nodeTypeColor: Record<string, string> = {
    api: '#0ea5e9',
    controller: '#6366f1',
    service: '#10b981',
    entity: '#f59e0b',
    module: '#64748b',
}

const nodeWidth = 220
const nodeHeight = 50

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    dagreGraph.setGraph({ rankdir: direction, nodesep: 40, ranksep: 100 })

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
    })

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target)
    })

    dagre.layout(dagreGraph)

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id)
        node.targetPosition = direction === 'LR' ? 'left' as any : 'top' as any
        node.sourcePosition = direction === 'LR' ? 'right' as any : 'bottom' as any

        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        }
        return node
    })

    return { nodes, edges }
}

const ArchitectureGraphViewer: React.FC<ArchitectureGraphViewerProps> = ({ projectId, commitHash, onNodeClick }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [allNodes, setAllNodes] = useState<Node[]>([])
    const [allEdges, setAllEdges] = useState<Edge[]>([])
    const [loading, setLoading] = useState(true)
    const [analysisUnavailable, setAnalysisUnavailable] = useState(false)
    
    // Focus and Search state
    const [focusedNode, setFocusedNode] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

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

                const initialNodes: Node[] = graphNodes.map((node: any) => {
                    const type = String(node.type || 'module')

                    return {
                        id: String(node.id),
                        data: { label: String(node.id), fullPath: String(node.id), type },
                        position: { x: 0, y: 0 },
                        style: {
                            background: 'var(--bg-default)',
                            color: 'var(--text-primary)',
                            border: `2px solid ${nodeTypeColor[type] || '#64748b'}`,
                            borderRadius: 'var(--radius-md)',
                            padding: '10px 14px',
                            width: nodeWidth,
                            fontSize: 12,
                            fontFamily: 'var(--font-mono)',
                            boxShadow: 'var(--shadow-sm)',
                        },
                    }
                })

                const initialEdges: Edge[] = graphEdges.map((edge: any, index: number) => ({
                    id: `repo-edge-${index}`,
                    source: String(edge.from),
                    target: String(edge.to),
                    label: String(edge.type || ''),
                    type: 'smoothstep',
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: 'var(--border-default)',
                    },
                    style: { stroke: 'var(--border-default)', strokeWidth: 1.5 },
                    labelStyle: { fill: 'var(--text-muted)', fontSize: 10 },
                }))

                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                    initialNodes,
                    initialEdges,
                    'LR' // Left-to-Right layout is better for architecture (API -> Controller -> Service -> Entity)
                )

                setAllNodes(layoutedNodes)
                setAllEdges(layoutedEdges)
                setNodes(layoutedNodes)
                setEdges(layoutedEdges)
            } finally {
                setLoading(false)
            }
        }

        fetchGraph()
    }, [projectId, commitHash, setEdges, setNodes])

    // Filter nodes based on focus and search
    useEffect(() => {
        let visibleNodes = [...allNodes]
        let visibleEdges = [...allEdges]

        if (focusedNode) {
            // Find all nodes connected to focused node
            const connectedEdges = allEdges.filter(e => e.source === focusedNode || e.target === focusedNode)
            const connectedNodeIds = new Set(connectedEdges.flatMap(e => [e.source, e.target]))
            connectedNodeIds.add(focusedNode)

            visibleNodes = allNodes.filter(n => connectedNodeIds.has(n.id))
            visibleEdges = connectedEdges
            
            // Highlight focused node
            visibleNodes = visibleNodes.map(n => ({
                ...n,
                style: {
                    ...n.style,
                    borderWidth: n.id === focusedNode ? '3px' : '2px',
                    opacity: n.id !== focusedNode ? 0.8 : 1,
                    background: n.id === focusedNode ? 'var(--bg-subtle)' : 'var(--bg-default)',
                }
            }))
        } else if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            visibleNodes = allNodes.map(n => {
                const isMatch = n.data.fullPath.toLowerCase().includes(query)
                return {
                    ...n,
                    style: {
                        ...n.style,
                        opacity: isMatch ? 1 : 0.3
                    }
                }
            })
        }

        setNodes(visibleNodes)
        setEdges(visibleEdges)
    }, [focusedNode, searchQuery, allNodes, allEdges, setNodes, setEdges])

    if (loading) return <div className="cr-doc-empty">Loading architecture graph...</div>
    if (analysisUnavailable) return <div className="cr-doc-empty">Analysis not available for this commit.</div>
    if (allNodes.length === 0) return <div className="cr-doc-empty">No architecture graph data available for this commit.</div>

    return (
        <div style={{ height: 600, width: '100%', position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-default)' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={(_, node) => {
                    setFocusedNode(node.id === focusedNode ? null : node.id)
                    onNodeClick?.(node.data.label)
                }}
                onPaneClick={() => setFocusedNode(null)}
                fitView
                fitViewOptions={{ padding: 0.2, minZoom: 0.2, maxZoom: 1.2 }}
                minZoom={0.1}
                maxZoom={1.5}
                attributionPosition="bottom-right"
            >
                <Background color="var(--border-default)" gap={20} size={1} />
                <Controls showInteractive={false} />
                
                <Panel position="top-left" style={{ background: 'var(--bg-default)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 280 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Boxes size={14} /> 
                            {focusedNode ? 'Focus Mode' : 'System Architecture'}
                        </span>
                        <span className="cr-severity cr-severity--info" style={{ fontSize: 10 }}>{allNodes.length} nodes</span>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter components..."
                            style={{ width: '100%', padding: '6px 10px 6px 30px', fontSize: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', background: 'var(--bg-subtle)', outline: 'none' }}
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                                <X size={12} color="var(--text-muted)" />
                            </button>
                        )}
                    </div>

                    {focusedNode && (
                        <div style={{ background: 'var(--bg-subtle)', padding: 8, borderRadius: 'var(--radius-md)', fontSize: 11, color: 'var(--text-secondary)' }}>
                            <button onClick={() => setFocusedNode(null)} className="cr-doc-btn" style={{ width: '100%', justifyContent: 'center' }}>Clear Focus</button>
                        </div>
                    )}
                </Panel>
                
                <Panel position="bottom-center" style={{ background: 'var(--bg-default)', padding: '8px 12px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)', display: 'flex', gap: 12, marginBottom: 12 }}>
                    <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: nodeTypeColor.api }}/> API</span>
                    <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: nodeTypeColor.controller }}/> Controller</span>
                    <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: nodeTypeColor.service }}/> Service</span>
                    <span style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}><div style={{ width: 8, height: 8, borderRadius: '50%', background: nodeTypeColor.entity }}/> Entity</span>
                </Panel>
            </ReactFlow>
        </div>
    )
}

export default ArchitectureGraphViewer
