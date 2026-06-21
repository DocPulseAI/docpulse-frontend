import React, { useEffect, useState, useRef } from 'react'
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    MarkerType,
    ReactFlowInstance,
    Panel
} from 'reactflow'
import 'reactflow/dist/style.css'
import { intelligenceApi } from '../services/api'
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

interface ExecutionFlowProps {
    projectId: string
    commitHash: string
}

const ExecutionFlow: React.FC<ExecutionFlowProps> = ({ projectId, commitHash }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const response = await intelligenceApi.getExecutionFlow(projectId, commitHash)

                const data = response.data
                if (Array.isArray(data) && data.length > 0) {
                    const path = Array.isArray(data[0]) ? data[0] : data

                    const newNodes: Node[] = path.map((step: any, index: number) => ({
                        id: `step-${index}`,
                        data: { label: step.label || step.name || `Step ${index + 1}` },
                        position: { x: 250, y: 100 * index },
                        style: {
                            background: 'var(--bg-elevated)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-default)',
                            borderRadius: '8px',
                            padding: '10px',
                            width: 200,
                            fontWeight: 500,
                            boxShadow: 'var(--shadow-sm)'
                        }
                    }))

                    const newEdges: Edge[] = []
                    for (let i = 0; i < path.length - 1; i++) {
                        newEdges.push({
                            id: `edge-${i}`,
                            source: `step-${i}`,
                            target: `step-${i + 1}`,
                            animated: true,
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                color: 'var(--accent-primary)',
                            },
                            style: { stroke: 'var(--accent-primary)', strokeWidth: 2 }
                        })
                    }

                    setNodes(newNodes)
                    setEdges(newEdges)
                } else {
                    setError('No execution flow data available')
                }
            } catch (err: any) {
                console.error('Error fetching execution flow:', err)
                setError(err.response?.data?.detail || 'Failed to load execution flow')
            } finally {
                setLoading(false)
            }
        }

        if (projectId && commitHash) {
            fetchData()
        }
    }, [projectId, commitHash, setNodes, setEdges])

    useEffect(() => {
        if (nodes.length === 0 || !rfInstance) return;
        const id = setTimeout(() => {
            rfInstance.fitView({ padding: 0.12, duration: 400 });
        }, 60);
        return () => clearTimeout(id);
    }, [nodes.length, rfInstance]);

    if (loading) return <div className="flex items-center justify-center h-full text-sm text-secondary">Loading Execution Flow...</div>
    if (error) return <div className="flex items-center justify-center h-full text-amber-500 text-sm">{error}</div>

    return (
        <div style={{ height: '100%', width: '100%', background: 'var(--bg-canvas)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-default)', position: 'relative' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onInit={setRfInstance}
                minZoom={0.1}
                maxZoom={1.5}
                fitView
            >
                <Background color="var(--border-default)" gap={20} size={1} />
                <MiniMap
                    style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-default)', borderRadius: '8px' }}
                    nodeColor={() => 'var(--accent-primary)'}
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
            </ReactFlow>
        </div>
    )
}

export default ExecutionFlow
