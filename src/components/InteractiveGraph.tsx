import { useEffect, useCallback } from 'react'
import ReactFlow, {
    Background,
    Controls,
    Edge,
    Node,
    addEdge,
    Connection,
    MarkerType,
    useNodesState,
    useEdgesState
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

const InteractiveGraph = ({ data, type = 'architecture' }: InteractiveGraphProps) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])

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
            let bg = 'var(--bg-card)'
            let borderColor = 'var(--border-default)'
            const nodeType = String(n.type || '').toLowerCase()

            // Premium Dark Theme styling
            if (nodeType.includes('api') || nodeType.includes('router') || nodeType.includes('controller')) {
                bg = 'linear-gradient(135deg, var(--accent-primary), #6366f1)'
                color = '#fff'
                borderColor = 'transparent'
            } else if (nodeType.includes('service') || nodeType.includes('logic')) {
                bg = 'rgba(99, 102, 241, 0.1)'
                borderColor = 'var(--accent-primary)'
                color = 'var(--accent-primary)'
            } else if (nodeType.includes('db') || nodeType.includes('model') || nodeType.includes('entity')) {
                bg = 'rgba(16, 185, 129, 0.1)'
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
                            <div style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.7, fontWeight: 700, marginBottom: '4px' }}>
                                {n.type || (type === 'datamodel' ? 'Entity' : 'Component')}
                            </div>
                            <div style={{ fontWeight: 600 }}>{n.name || n.id}</div>
                        </div>
                    )
                },
                position: { x: n.x, y: n.y },
                style: {
                    background: bg,
                    color: color,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '10px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
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
            style: { stroke: 'var(--accent-primary)', strokeWidth: 2, opacity: 0.4 },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                color: 'var(--accent-primary)',
            },
        }))

        setNodes(rfNodes)
        setEdges(rfEdges)
    }, [data, type, setNodes, setEdges])

    return (
        <div style={{ width: '100%', height: '100%', minHeight: '500px' }} className="interactive-graph">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
            >
                <Background color="var(--border-subtle)" gap={20} size={1} />
                <Controls showInteractive={false} />
            </ReactFlow>
        </div>
    )
}

export default InteractiveGraph
