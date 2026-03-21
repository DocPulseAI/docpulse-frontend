import React, { useEffect, useState } from 'react'
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    MarkerType
} from 'reactflow'
import 'reactflow/dist/style.css'
import { intelligenceApi } from '../services/api'

interface ExecutionFlowProps {
    projectId: string
    commitHash: string
}

const ExecutionFlow: React.FC<ExecutionFlowProps> = ({ projectId, commitHash }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const response = await intelligenceApi.getExecutionFlow(projectId, commitHash)

                const data = response.data
                if (Array.isArray(data) && data.length > 0) {
                    // If we have multiple paths, just take the first one or combine them
                    // For now, let's assume we take the first path and render it linearly
                    const path = Array.isArray(data[0]) ? data[0] : data

                    const newNodes: Node[] = path.map((step: any, index: number) => ({
                        id: `step-${index}`,
                        data: { label: step.label || step.name || `Step ${index + 1}` },
                        position: { x: 250, y: 100 * index },
                        style: {
                            background: '#0f172a',
                            color: '#f8fafc',
                            border: '1px solid #f59e0b',
                            borderRadius: '8px',
                            padding: '10px',
                            width: 200
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
                                color: '#f59e0b',
                            },
                            style: { stroke: '#f59e0b' }
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

    if (loading) return <div className="flex items-center justify-center h-full">Loading Execution Flow...</div>
    if (error) return <div className="flex items-center justify-center h-full text-amber-500">{error}</div>

    return (
        <div className="execution-flow-container h-full w-full bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
            >
                <Background color="#334155" gap={20} />
                <Controls />
            </ReactFlow>
        </div>
    )
}

export default ExecutionFlow
