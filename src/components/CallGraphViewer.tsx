import React, { useEffect, useState, useRef } from 'react'
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useEdgesState,
    useNodesState,
    Node,
    Edge,
    Panel,
    ReactFlowInstance,
    ReactFlowProvider
} from 'reactflow'
import 'reactflow/dist/style.css'
import dagre from 'dagre'
import { intelligenceApi } from '../services/api'
import { Workflow, Search, X, Maximize2, Minimize2, ZoomIn, ZoomOut } from 'lucide-react'

export const nodeTypeColor: Record<string, string> = {
    API: 'var(--graph-node-service)',
    Controller: 'var(--graph-node-controller)',
    Service: 'var(--graph-node-model)',
    Entity: 'var(--graph-node-queue)',
    Module: 'var(--graph-node-unknown)',
}

interface CallGraphViewerProps {
    projectId: string
    commitHash: string
    onNodeClick?: (label: string) => void
}

import { nodeTypes, applyEdgeDefaults, EDGE_DEFAULTS } from './edgeConfig'

const nodeWidth = 200
const nodeHeight = 90

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))
    dagreGraph.setGraph({ 
        rankdir: direction, 
        ranker: 'tight-tree',
        ranksep: direction === 'LR' ? 80 : 60,
        nodesep: direction === 'LR' ? 20 : 16,
        edgesep: 10,
        marginx: 40,
        marginy: 40
    })

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

const CallGraphViewer: React.FC<CallGraphViewerProps> = ({ projectId, commitHash, onNodeClick }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [allNodes, setAllNodes] = useState<Node[]>([])
    const [allEdges, setAllEdges] = useState<Edge[]>([])
    const [loading, setLoading] = useState(true)
    const [analysisUnavailable, setAnalysisUnavailable] = useState(false)

    // Focus and Search state
    const [focusedNode, setFocusedNode] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
            if (rfInstance) {
                setTimeout(() => rfInstance.fitView({ padding: 0.12, duration: 400 }), 100)
            }
        }
        document.addEventListener('fullscreenchange', handleFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }, [rfInstance])

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => console.error(err))
        } else {
            document.exitFullscreen()
        }
    }

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

                const typeMapping: Record<string, string> = {
                    api: 'API',
                    controller: 'Controller',
                    service: 'Service',
                    entity: 'Entity',
                    module: 'Module'
                }

                const initialNodes: Node[] = graphNodes.map((nodeId: string) => {
                    const label = String(nodeId);
                    let type = 'Module';
                    
                    if (label.includes('/api/') || label.match(/^(GET|POST|PUT|DELETE|PATCH) /)) {
                        type = 'API';
                    } else if (label.toLowerCase().includes('controller')) {
                        type = 'Controller';
                    } else if (label.toLowerCase().includes('service')) {
                        type = 'Service';
                    } else if (label.toLowerCase().includes('entity') || label.toLowerCase().includes('repository')) {
                        type = 'Entity';
                    }

                    return {
                        id: label,
                        type: 'custom',
                        data: { 
                            label, 
                            fullPath: label, 
                            type,
                            description: label
                        },
                        position: { x: 0, y: 0 },
                    };
                });

                const rawEdges: Edge[] = graphEdges.map((edge: any, index: number) => ({
                    id: `call-edge-${index}`,
                    source: String(edge.from),
                    target: String(edge.to),
                    label: String(edge.type || 'calls'),
                }))
                const initialEdges = applyEdgeDefaults(rawEdges)

                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                    initialNodes,
                    initialEdges,
                    'LR' // Left-to-Right is ideal for call sequences
                )

                setAllNodes(layoutedNodes)
                setAllEdges(layoutedEdges)
                setNodes(layoutedNodes)
                setEdges(layoutedEdges)
            } finally {
                setLoading(false)
            }
        }

        fetchCallGraph()
    }, [projectId, commitHash, setEdges, setNodes])

    useEffect(() => {
        if (allNodes.length === 0 || !rfInstance) return;
        const id = setTimeout(() => {
            rfInstance.fitView({ padding: 0.12, duration: 400 });
        }, 60);
        return () => clearTimeout(id);
    }, [allNodes.length, rfInstance]);

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
            
            // For custom nodes, highlight via 'selected' or style overrides
            visibleNodes = visibleNodes.map(n => ({
                ...n,
                selected: n.id === focusedNode,
                style: {
                    opacity: n.id !== focusedNode ? 0.4 : 1,
                }
            }))
            
            if (rfInstance) {
                setTimeout(() => {
                    rfInstance.fitView({ nodes: visibleNodes, duration: 800, padding: 0.2 })
                }, 50)
            }
        } else if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            const matchedNodes: Node[] = []
            
            visibleNodes = allNodes.map(n => {
                const isMatch = n.data.fullPath.toLowerCase().includes(query)
                if (isMatch) matchedNodes.push(n)
                return {
                    ...n,
                    style: {
                        opacity: isMatch ? 1 : 0.3
                    }
                }
            })
            
            if (rfInstance && matchedNodes.length > 0) {
                setTimeout(() => {
                    rfInstance.fitView({ nodes: matchedNodes, duration: 800, padding: 0.2, maxZoom: 1.2 })
                }, 50)
            }
        } else {
            if (rfInstance && visibleNodes.length > 0) {
                setTimeout(() => {
                    rfInstance.fitView({ duration: 800, padding: 0.2 })
                }, 50)
            }
        }

        setNodes(visibleNodes)
        setEdges(visibleEdges)
    }, [focusedNode, searchQuery, allNodes, allEdges, setNodes, setEdges, rfInstance])

    if (loading) return <div className="cr-doc-empty">Loading call graph...</div>
    if (analysisUnavailable) return <div className="cr-doc-empty">Analysis not available for this commit.</div>
    if (allNodes.length === 0) return <div className="cr-doc-empty">No call graph data available for this commit.</div>

    return (
        <div ref={containerRef} style={{ height: isFullscreen ? '100vh' : 600, width: '100%', position: 'relative', borderRadius: isFullscreen ? 0 : 'var(--radius-lg)', overflow: 'hidden', border: isFullscreen ? 'none' : '1px solid var(--border-default)', background: 'var(--bg-default)' }}>
            <ReactFlowProvider>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onInit={setRfInstance}
                onNodeClick={(_, node) => {
                    setFocusedNode(node.id === focusedNode ? null : node.id)
                    onNodeClick?.(node.data.label)
                }}
                onPaneClick={() => setFocusedNode(null)}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={EDGE_DEFAULTS}
                fitView
                fitViewOptions={{ padding: 0.2, minZoom: 0.2, maxZoom: 1.2 }}
                minZoom={0.1}
                maxZoom={1.5}
                attributionPosition="bottom-right"
            >
                <Background color="var(--border-default)" gap={20} size={1} />
                <MiniMap
                    style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-default)', borderRadius: '8px' }}
                    nodeColor={(node) => {
                        const rawType = String(node.data?.type || 'Module')
                        return nodeTypeColor[rawType] || 'var(--graph-node-unknown)'
                    }}
                    maskColor="rgba(0, 0, 0, 0.15)"
                />
                
                {/* Floating custom zoom controls */}
                <Panel position="bottom-left" style={{ display: 'flex', gap: 6, background: 'var(--bg-default)', padding: 4, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)', marginBottom: 12, marginLeft: 12 }}>
                    <button onClick={() => rfInstance?.zoomIn()} className="cr-doc-btn" style={{ padding: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Zoom In">
                        <ZoomIn size={14} />
                    </button>
                    <button onClick={() => rfInstance?.zoomOut()} className="cr-doc-btn" style={{ padding: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Zoom Out">
                        <ZoomOut size={14} />
                    </button>
                    <button onClick={() => rfInstance?.fitView({ duration: 400 })} className="cr-doc-btn" style={{ padding: 6, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} title="Fit View">
                        <Maximize2 size={14} />
                    </button>
                </Panel>
                
                <Panel position="top-right" style={{ background: 'var(--bg-default)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 12, minWidth: 280 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Workflow size={14} /> 
                            {focusedNode ? 'Focus Mode' : 'Execution Traces'}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span className="cr-severity cr-severity--info" style={{ fontSize: 10 }}>{allNodes.length} nodes</span>
                            <button onClick={toggleFullscreen} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }} title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
                                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Filter sequences..."
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
            </ReactFlow>
            </ReactFlowProvider>
        </div>
    )
}

export default CallGraphViewer
