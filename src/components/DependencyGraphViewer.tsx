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
import { GitFork, Search, X } from 'lucide-react'

interface DependencyGraphViewerProps {
    projectId: string
    commitHash: string
    onNodeClick?: (label: string) => void
}

const nodeWidth = 220
const nodeHeight = 50

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    dagreGraph.setGraph({ rankdir: direction })

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

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        }
        return node
    })

    return { nodes, edges }
}

const DependencyGraphViewer: React.FC<DependencyGraphViewerProps> = ({ projectId, commitHash, onNodeClick }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [allNodes, setAllNodes] = useState<Node[]>([])
    const [allEdges, setAllEdges] = useState<Edge[]>([])
    
    const [cycles, setCycles] = useState<string[][]>([])
    const [loading, setLoading] = useState(true)
    const [analysisUnavailable, setAnalysisUnavailable] = useState(false)

    // Focus state
    const [focusedNode, setFocusedNode] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')

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

                const initialNodes: Node[] = modules.map((module: string) => ({
                    id: module,
                    data: { label: module.split('/').pop() || module, fullPath: module },
                    position: { x: 0, y: 0 },
                    style: {
                        background: 'var(--bg-default)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 14px',
                        fontSize: 12,
                        fontFamily: 'var(--font-mono)',
                        boxShadow: 'var(--shadow-sm)',
                        width: nodeWidth,
                    },
                }))

                const initialEdges: Edge[] = dependencies.map((edge: any, index: number) => ({
                    id: `dep-edge-${index}`,
                    source: edge.from,
                    target: edge.to,
                    type: 'smoothstep',
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: 'var(--text-muted)',
                    },
                    style: { stroke: 'var(--border-default)', strokeWidth: 1.5 },
                }))

                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                    initialNodes,
                    initialEdges,
                    'TB'
                )

                setAllNodes(layoutedNodes)
                setAllEdges(layoutedEdges)
                setNodes(layoutedNodes)
                setEdges(layoutedEdges)
            } finally {
                setLoading(false)
            }
        }

        fetchDependencies()
    }, [projectId, commitHash, setEdges, setNodes])

    // Filter nodes based on focus and search
    useEffect(() => {
        let visibleNodes = [...allNodes]
        let visibleEdges = [...allEdges]

        if (focusedNode) {
            // Find all nodes connected to focused node (1 degree of separation)
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
                    border: n.id === focusedNode ? '2px solid var(--accent-primary)' : '1px solid var(--border-default)',
                    background: n.id === focusedNode ? 'var(--accent-primary-soft)' : 'var(--bg-default)',
                    opacity: n.id !== focusedNode ? 0.8 : 1
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
                        border: isMatch ? '2px solid var(--accent-primary)' : '1px solid var(--border-default)',
                        opacity: isMatch ? 1 : 0.3
                    }
                }
            })
        }

        setNodes(visibleNodes)
        setEdges(visibleEdges)
    }, [focusedNode, searchQuery, allNodes, allEdges, setNodes, setEdges])

    if (loading) return <div className="cr-doc-empty">Loading dependency graph...</div>
    if (analysisUnavailable) return <div className="cr-doc-empty">Analysis not available for this commit.</div>
    if (allNodes.length === 0) return <div className="cr-doc-empty">No dependency data available for this commit.</div>

    return (
        <div style={{ height: 600, width: '100%', position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-default)' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={(_, node) => {
                    setFocusedNode(node.id === focusedNode ? null : node.id)
                    onNodeClick?.(node.data.fullPath)
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
                            <GitFork size={14} /> 
                            {focusedNode ? 'Focus Mode' : 'System Dependencies'}
                        </span>
                        <span className="cr-severity cr-severity--info" style={{ fontSize: 10 }}>{allNodes.length} modules</span>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter modules..."
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
                            <div style={{ marginBottom: 4, fontWeight: 600, color: 'var(--text-primary)' }}>Focusing on:</div>
                            <div style={{ fontFamily: 'var(--font-mono)', wordBreak: 'break-all' }}>{focusedNode}</div>
                            <button onClick={() => setFocusedNode(null)} className="cr-doc-btn" style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}>Clear Focus</button>
                        </div>
                    )}

                    {cycles.length > 0 && !focusedNode && (
                        <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: 12, marginTop: 4 }}>
                            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--severity-critical)', marginBottom: 8 }}>{cycles.length} Cycles Detected</div>
                            <div style={{ maxHeight: 100, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {cycles.map((c, i) => (
                                    <div key={i} style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', background: 'var(--severity-critical-glow)', padding: '4px 6px', borderRadius: 4 }}>
                                        {c.map(p => p.split('/').pop()).join(' → ')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Panel>
            </ReactFlow>
        </div>
    )
}

export default DependencyGraphViewer
