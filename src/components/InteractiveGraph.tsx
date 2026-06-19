import { useEffect, useCallback, useState } from 'react'
import ReactFlow, {
    Background,
    Controls,
    Edge,
    Node,
    addEdge,
    Connection,
    MarkerType,
    useNodesState,
    useEdgesState,
    ReactFlowInstance,
    ReactFlowProvider
} from 'reactflow'
import 'reactflow/dist/style.css'
import * as d3 from 'd3'

interface InteractiveGraphProps {
    data: {
        nodes?: any[]
        components?: any[]
        edges?: any[]
        relationships?: any[]
    }
    type?: 'architecture' | 'dependencies' | 'datamodel'
}

const InteractiveGraphContent = ({ data, type = 'architecture' }: InteractiveGraphProps) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null)

    const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges])

    useEffect(() => {
        const rawNodes = data.nodes || data.components || []
        const rawEdges = data.edges || data.relationships || []

        if (rawNodes.length === 0) return

        // 1. Prepare D3 simulation for layout
        const simulationNodes = rawNodes.map(n => ({ id: String(n.id || n.name), ...n }))
        const simulationLinks = rawEdges.map((e, i) => ({
            source: String(e.source || e.from),
            target: String(e.target || e.to),
            id: `e-${i}`
        })).filter(l =>
            simulationNodes.find(n => n.id === l.source) &&
            simulationNodes.find(n => n.id === l.target)
        )

        const width = 800
        const height = 600

        const simulation = d3.forceSimulation(simulationNodes as any)
            .force("link", d3.forceLink(simulationLinks).id((d: any) => d.id).distance(150))
            .force("charge", d3.forceManyBody().strength(-500))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(80))
            .stop()

        // Run simulation for a fixed number of ticks
        for (let i = 0; i < 300; ++i) simulation.tick()

        // 2. Map D3 nodes to ReactFlow nodes
        const rfNodes: Node[] = simulationNodes.map((n: any) => {
            let color = 'var(--text-primary)'
            let bg = 'var(--bg-default)'
            let borderColor = 'var(--border-default)'
            const nodeType = String(n.type || '').toLowerCase()

            if (nodeType.includes('api') || nodeType.includes('router') || nodeType.includes('controller')) {
                bg = 'var(--accent-primary-soft)'
                borderColor = 'var(--accent-primary-border)'
                color = 'var(--accent-primary)'
            } else if (nodeType.includes('service') || nodeType.includes('logic')) {
                bg = 'var(--accent-blue-soft)'
                borderColor = 'var(--accent-blue)'
                color = 'var(--accent-blue)'
            } else if (nodeType.includes('db') || nodeType.includes('model') || nodeType.includes('entity')) {
                bg = 'var(--accent-green-soft)'
                borderColor = 'var(--accent-green)'
                color = 'var(--accent-green)'
            } else if (nodeType.includes('util') || nodeType.includes('helper')) {
                bg = 'var(--bg-subtle)'
                color = 'var(--text-muted)'
            }

            return {
                id: n.id,
                type: 'default',
                data: {
                    label: (
                        <div style={{ padding: '8px 12px', minWidth: '120px' }}>
                            <div style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.7, fontWeight: 700, marginBottom: '4px', color: 'var(--text-secondary)' }}>
                                {n.type || (type === 'datamodel' ? 'Entity' : 'Component')}
                            </div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{n.name || n.id}</div>
                        </div>
                    )
                },
                position: { x: n.x, y: n.y },
                style: {
                    background: bg,
                    color: color,
                    border: `1px solid ${borderColor}`,
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-sm)',
                    width: 'auto',
                    padding: 0
                }
            }
        })

        const rfEdges: Edge[] = simulationLinks.map((l: any) => ({
            id: l.id,
            source: l.source.id || l.source,
            target: l.target.id || l.target,
            animated: true,
            style: { stroke: 'var(--border-default)', strokeWidth: 1.5 },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: 'var(--border-default)',
            },
        }))

        setNodes(rfNodes)
        setEdges(rfEdges)
    }, [data, type, setNodes, setEdges])

    useEffect(() => {
        if (nodes.length === 0 || !rfInstance) return

        const t1 = setTimeout(() => rfInstance.fitView({ padding: 0.2, duration: 200 }), 50)
        const t2 = setTimeout(() => rfInstance.fitView({ padding: 0.2, duration: 200 }), 200)
        const t3 = setTimeout(() => rfInstance.fitView({ padding: 0.2, duration: 200 }), 500)

        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
            clearTimeout(t3)
        }
    }, [nodes.length, rfInstance])

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '500px' }} className="interactive-graph">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onInit={setRfInstance}
                fitView
                fitViewOptions={{ padding: 0.2, minZoom: 0.2, maxZoom: 1.2 }}
                minZoom={0.1}
                maxZoom={1.5}
            >
                <Background color="var(--border-subtle)" gap={20} size={1} />
                <Controls showInteractive={false} />
            </ReactFlow>
        </div>
    )
}

const InteractiveGraph = (props: InteractiveGraphProps) => (
    <ReactFlowProvider>
        <InteractiveGraphContent {...props} />
    </ReactFlowProvider>
)

export default InteractiveGraph
