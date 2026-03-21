import React, { useEffect, useState } from 'react'
import ReactFlow, {
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    Node,
    Edge,
    MarkerType
} from 'reactflow'
import 'reactflow/dist/style.css'
import { intelligenceApi } from '../services/api'

interface ArchitectureGraphProps {
    projectId: string
    commitHash: string
    type?: 'architecture' | 'dependencies'
}

const ArchitectureGraph: React.FC<ArchitectureGraphProps> = ({ projectId, commitHash, type = 'architecture' }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const { data } = type === 'dependencies'
                    ? await intelligenceApi.getDependencies(projectId, commitHash)
                    : await intelligenceApi.getArchitecture(projectId, commitHash)

                if (data.nodes && data.edges) {
                    // Add some default styling if not present
                    const processedNodes = data.nodes.map((node: Node) => ({
                        ...node,
                        style: {
                            background: '#1e293b',
                            color: '#f8fafc',
                            border: '1px solid #334155',
                            borderRadius: '8px',
                            padding: '10px',
                            width: 150,
                            ...node.style
                        }
                    }))

                    const processedEdges = data.edges.map((edge: Edge) => ({
                        ...edge,
                        animated: true,
                        markerEnd: {
                            type: MarkerType.ArrowClosed,
                            color: '#94a3b8',
                        },
                        style: { stroke: '#94a3b8', ...edge.style }
                    }))

                    setNodes(processedNodes)
                    setEdges(processedEdges)
                } else {
                    setError('Invalid architecture data format')
                }
            } catch (err: any) {
                console.error('Error fetching architecture:', err)
                setError(err.response?.data?.detail || 'Failed to load architecture graph')
            } finally {
                setLoading(false)
            }
        }

        if (projectId && commitHash) {
            fetchData()
        }
    }, [projectId, commitHash, type, setNodes, setEdges])

    if (loading) return <div className="flex items-center justify-center h-full">Loading Architecture Graph...</div>
    if (error) return <div className="flex items-center justify-center h-full text-red-500">{error}</div>

    return (
        <div className="architecture-graph-container h-full w-full bg-slate-50 dark:bg-slate-950 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
            >
                <Background color="#94a3b8" gap={20} />
                <Controls />
                <MiniMap nodeColor="#334155" maskColor="rgba(0, 0, 0, 0.1)" />
            </ReactFlow>
        </div>
    )
}

export default ArchitectureGraph
