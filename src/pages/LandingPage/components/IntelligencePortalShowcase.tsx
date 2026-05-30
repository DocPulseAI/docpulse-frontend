import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactFlow, { Background, Controls, Node, Edge, ReactFlowProvider } from 'reactflow'
import 'reactflow/dist/style.css'
import {
    Boxes, GitFork, Workflow, Search, Sliders, ChevronRight, CheckCircle2, AlertTriangle, Play
} from 'lucide-react'
import CustomGraphNode from '../../../components/CustomGraphNode'
import { applyEdgeDefaults } from '../../../components/edgeConfig'

const mockNodeTypes = {
    custom: CustomGraphNode,
}

type TabType = 'structure' | 'dependencies' | 'execution' | 'symbols'

interface MockSymbol {
    name: string
    type: 'class' | 'function' | 'interface'
    path: string
    docstring: string
    dependencies: string[]
}

const mockSymbols: MockSymbol[] = [
    {
        name: 'CheckoutController',
        type: 'class',
        path: 'src/controllers/CheckoutController.ts',
        docstring: 'Handles incoming payment and order creation request payloads. Parses cart tokens and forwards transactions to PaymentService.',
        dependencies: ['PaymentService', 'InventoryService', 'OrderEntity']
    },
    {
        name: 'PaymentService.processPayment',
        type: 'function',
        path: 'src/services/PaymentService.ts',
        docstring: 'Verifies customer funds and captures transaction amounts via external credit processing gateways.',
        dependencies: ['OrderEntity', 'GatewayClient']
    },
    {
        name: 'InventoryService.updateStock',
        type: 'function',
        path: 'src/services/InventoryService.ts',
        docstring: 'Decrements physical counts of product items matching purchase actions. Emits event on critical low levels.',
        dependencies: ['ProductEntity', 'EventBus']
    },
    {
        name: 'OrderEntity',
        type: 'interface',
        path: 'src/models/OrderEntity.ts',
        docstring: 'Database schema map storing order statuses, totals, item items, and reference payment transactions.',
        dependencies: []
    }
]

export default function IntelligencePortalShowcase() {
    const [activeTab, setActiveTab] = useState<TabType>('structure')
    const [depthLevel, setDepthLevel] = useState<number>(3)
    const [selectedNodeInfo, setSelectedNodeInfo] = useState<any>({
        label: 'API Gateway',
        type: 'API',
        description: 'Main incoming gateway for Checkout API requests.'
    })
    const [symbolQuery, setSymbolQuery] = useState('')
    const [selectedSymbol, setSelectedSymbol] = useState<MockSymbol>(mockSymbols[0])

    // Depth-based filter for Tab 1
    const structureNodes = useMemo<Node[]>(() => {
        const all = [
            {
                id: 'gateway',
                type: 'custom',
                data: { label: 'API Gateway', type: 'API', description: 'Main incoming gateway for Checkout API requests.', depthLevel: 0 },
                position: { x: 20, y: 140 }
            },
            {
                id: 'checkout-ctrl',
                type: 'custom',
                data: { label: 'CheckoutController', type: 'Controller', description: 'Receives request and extracts payloads.', depthLevel: 1 },
                position: { x: 260, y: 50 }
            },
            {
                id: 'user-ctrl',
                type: 'custom',
                data: { label: 'UserController', type: 'Controller', description: 'Manages user profile sessions.', depthLevel: 1 },
                position: { x: 260, y: 230 }
            },
            {
                id: 'payment-svc',
                type: 'custom',
                data: { label: 'PaymentService', type: 'Service', description: 'Validates payment gateways.', depthLevel: 2 },
                position: { x: 500, y: 0 }
            },
            {
                id: 'inventory-svc',
                type: 'custom',
                data: { label: 'InventoryService', type: 'Service', description: 'Tracks item allocations.', depthLevel: 2 },
                position: { x: 500, y: 110 }
            },
            {
                id: 'user-svc',
                type: 'custom',
                data: { label: 'UserService', type: 'Service', description: 'Aggregates profile details.', depthLevel: 2 },
                position: { x: 500, y: 260 }
            },
            {
                id: 'order-entity',
                type: 'custom',
                data: { label: 'OrderEntity', type: 'Entity', description: 'Relational map for checkout orders.', depthLevel: 3 },
                position: { x: 740, y: 50 }
            },
            {
                id: 'user-entity',
                type: 'custom',
                data: { label: 'UserEntity', type: 'Entity', description: 'Database schema for users.', depthLevel: 3 },
                position: { x: 740, y: 210 }
            }
        ]
        return all.filter(n => (n.data.depthLevel ?? 0) <= depthLevel)
    }, [depthLevel])

    const structureEdges = useMemo<Edge[]>(() => {
        const all = [
            { id: 'e1', source: 'gateway', target: 'checkout-ctrl', label: 'route' },
            { id: 'e2', source: 'gateway', target: 'user-ctrl', label: 'route' },
            { id: 'e3', source: 'checkout-ctrl', target: 'payment-svc', label: 'calls' },
            { id: 'e4', source: 'checkout-ctrl', target: 'inventory-svc', label: 'calls' },
            { id: 'e5', source: 'user-ctrl', target: 'user-svc', label: 'calls' },
            { id: 'e6', source: 'payment-svc', target: 'order-entity', label: 'mutates' },
            { id: 'e7', source: 'inventory-svc', target: 'order-entity', label: 'reads' },
            { id: 'e8', source: 'user-svc', target: 'user-entity', label: 'mutates' },
        ]
        // Filter edges to only keep those where both source and target nodes exist in filtered list
        const activeIds = new Set(structureNodes.map(n => n.id))
        return applyEdgeDefaults(all.filter(e => activeIds.has(e.source) && activeIds.has(e.target)))
    }, [structureNodes])

    // Dependency Coupling Graph
    const dependencyNodes = useMemo<Node[]>(() => {
        return [
            {
                id: 'auth-mod',
                type: 'custom',
                data: { label: 'AuthModule', type: 'Module', description: 'Handles auth state and token verification.', isCyclic: true },
                position: { x: 100, y: 120 }
            },
            {
                id: 'session-mod',
                type: 'custom',
                data: { label: 'SessionModule', type: 'Module', description: 'Validates browser sessions.', isCyclic: true },
                position: { x: 400, y: 40 }
            },
            {
                id: 'token-mod',
                type: 'custom',
                data: { label: 'TokenModule', type: 'Module', description: 'Cryptographically issues session keys.', isCyclic: true },
                position: { x: 400, y: 220 }
            },
            {
                id: 'logger-mod',
                type: 'custom',
                data: { label: 'LoggerModule', type: 'Module', description: 'General system logger helper.' },
                position: { x: 700, y: 120 }
            }
        ]
    }, [])

    const dependencyEdges = useMemo<Edge[]>(() => {
        const raw = [
            { id: 'de1', source: 'auth-mod', target: 'session-mod', label: 'depends' },
            { id: 'de2', source: 'session-mod', target: 'token-mod', label: 'depends' },
            { id: 'de3', source: 'token-mod', target: 'auth-mod', label: 'cyclic-dep', style: { stroke: '#EF4444', strokeWidth: 2 }, animated: true },
            { id: 'de4', source: 'auth-mod', target: 'logger-mod', label: 'utilizes' },
            { id: 'de5', source: 'token-mod', target: 'logger-mod', label: 'utilizes' }
        ]
        return applyEdgeDefaults(raw)
    }, [])

    // Execution Call sequence
    const executionNodes = useMemo<Node[]>(() => {
        return [
            {
                id: 'call-api',
                type: 'custom',
                data: { label: 'POST /api/checkout', type: 'API', description: 'Checkout request initiator.' },
                position: { x: 20, y: 120 }
            },
            {
                id: 'call-ctrl',
                type: 'custom',
                data: { label: 'CheckoutController.submit', type: 'Controller', description: 'Processes and transforms incoming payload.' },
                position: { x: 260, y: 120 }
            },
            {
                id: 'call-svc-pay',
                type: 'custom',
                data: { label: 'PaymentService.charge', type: 'Service', description: 'Executes card charge sequence.' },
                position: { x: 500, y: 40 }
            },
            {
                id: 'call-svc-inv',
                type: 'custom',
                data: { label: 'InventoryService.reserve', type: 'Service', description: 'Locks items temporarily in db.' },
                position: { x: 500, y: 210 }
            },
            {
                id: 'call-db',
                type: 'custom',
                data: { label: 'OrderEntity.save', type: 'Entity', description: 'Persists order data payload.' },
                position: { x: 740, y: 120 }
            }
        ]
    }, [])

    const executionEdges = useMemo<Edge[]>(() => {
        const raw = [
            { id: 'ee1', source: 'call-api', target: 'call-ctrl', label: 'trigger' },
            { id: 'ee2', source: 'call-ctrl', target: 'call-svc-pay', label: 'step 1', animated: true },
            { id: 'ee3', source: 'call-ctrl', target: 'call-svc-inv', label: 'step 2', animated: true },
            { id: 'ee4', source: 'call-svc-pay', target: 'call-db', label: 'step 3', animated: true },
            { id: 'ee5', source: 'call-svc-inv', target: 'call-db', label: 'step 4', animated: true }
        ]
        return applyEdgeDefaults(raw)
    }, [])

    const filteredSymbols = useMemo(() => {
        if (!symbolQuery.trim()) return mockSymbols
        const query = symbolQuery.toLowerCase()
        return mockSymbols.filter(s => s.name.toLowerCase().includes(query) || s.path.toLowerCase().includes(query))
    }, [symbolQuery])

    return (
        <section id="intelligence-portal" className="lp-section">
            <hr className="lp-divider" />

            <div className="lp-container" style={{ paddingTop: 40 }}>
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="lp-section-header"
                >
                    <span className="lp-badge">
                        <Boxes size={13} style={{ color: 'var(--accent-purple)' }} />
                        Developer Intelligence Portal
                    </span>
                    <h2 className="lp-section-title" style={{ marginTop: 16 }}>
                        Interactive System Mapping
                    </h2>
                    <p className="lp-section-subtitle">
                        DocPulse AI parses your AST to reconstruct dynamic dependency call maps, module couplings, and searchable symbol declarations.
                    </p>
                </motion.div>

                {/* Segmented Controls / Tabs */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
                    {[
                        { id: 'structure', label: 'Architecture Map', icon: <Boxes size={14} />, desc: 'Chromatic code boundaries' },
                        { id: 'dependencies', label: 'Module Coupling', icon: <GitFork size={14} />, desc: 'Cycle & dependency analyzer' },
                        { id: 'execution', label: 'Execution Flows', icon: <Workflow size={14} />, desc: 'Trace-level requests sequences' },
                        { id: 'symbols', label: 'Symbol Index', icon: <Search size={14} />, desc: 'Searchable code declaration' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as TabType)
                                if (tab.id === 'structure') setSelectedNodeInfo(structureNodes[0].data)
                                if (tab.id === 'dependencies') setSelectedNodeInfo(dependencyNodes[0].data)
                                if (tab.id === 'execution') setSelectedNodeInfo(executionNodes[0].data)
                            }}
                            className={`lp-diagram-tab ${activeTab === tab.id ? 'active' : ''}`}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '10px 16px', minWidth: 180, textAlign: 'left' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                                {tab.icon}
                                <span>{tab.label}</span>
                            </div>
                            <span style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{tab.desc}</span>
                        </button>
                    ))}
                </div>

                {/* Interactive Area */}
                <div style={{ background: 'var(--bg-inset, var(--bg-default))', border: '1px solid var(--border-default)', borderRadius: 12, overflow: 'hidden', minHeight: 520, display: 'grid', gridTemplateColumns: activeTab === 'symbols' ? '1fr' : '300px 1fr' }} className="lp-intelligence-showcase-panel">
                    {/* Left Column Inspector (For Graph Tabs) */}
                    {activeTab !== 'symbols' && (
                        <div style={{ borderRight: '1px solid var(--border-default)', padding: 20, display: 'flex', flexDirection: 'column', background: 'var(--bg-default)' }}>
                            <h4 style={{ fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                                <Sliders size={14} className="text-blue-500" />
                                Interactive Inspector
                            </h4>

                            {activeTab === 'structure' && (
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                                        Graph Depth Boundary: {depthLevel}
                                    </label>
                                    <input
                                        type="range"
                                        min="1"
                                        max="3"
                                        value={depthLevel}
                                        onChange={(e) => setDepthLevel(parseInt(e.target.value))}
                                        style={{ width: '100%', height: 4, borderRadius: 2, background: 'var(--border-default)', outline: 'none' }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', marginTop: 4 }}>
                                        <span>Depth 1</span>
                                        <span>Depth 2</span>
                                        <span>Depth 3</span>
                                    </div>
                                </div>
                            )}

                            {selectedNodeInfo ? (
                                <motion.div
                                    key={selectedNodeInfo.label}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}
                                >
                                    <div style={{ padding: 12, borderRadius: 6, background: 'var(--bg-subtle)', border: '1px solid var(--border-muted)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: 'var(--border-default)', color: 'var(--text-primary)' }}>
                                                {selectedNodeInfo.type}
                                            </span>
                                            {selectedNodeInfo.isCyclic && (
                                                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: 'rgba(239, 68, 68, 0.1)', color: '#EF4444', display: 'flex', alignItems: 'center', gap: 3 }}>
                                                    <AlertTriangle size={8} /> CYCLE
                                                </span>
                                            )}
                                        </div>
                                        <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>{selectedNodeInfo.label}</strong>
                                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, lineHeight: 1.4 }}>
                                            {selectedNodeInfo.description}
                                        </p>
                                    </div>

                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-muted)' }}>
                                            <span>Trace Status</span>
                                            <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Active</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-muted)' }}>
                                            <span>Sync State</span>
                                            <span>Commit OK</span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 'auto' }}>
                                        * Click any node in the graph viewer on the right to inspect its detailed references.
                                    </p>
                                </motion.div>
                            ) : (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                                    Select a node to inspect
                                </div>
                            )}
                        </div>
                    )}

                    {/* Right Column Graph Canvas / Search Index Layout */}
                    <div style={{ position: 'relative', height: 520, background: 'var(--bg-inset)' }} className="lp-intelligence-canvas-wrap">
                        {activeTab === 'structure' && (
                            <ReactFlowProvider>
                                <ReactFlow
                                    nodes={structureNodes}
                                    edges={structureEdges}
                                    nodeTypes={mockNodeTypes}
                                    onNodeClick={(_, node) => setSelectedNodeInfo(node.data)}
                                    fitView
                                    zoomOnScroll={false}
                                    panOnDrag={false}
                                    zoomOnDoubleClick={false}
                                    style={{ background: 'var(--bg-inset)' }}
                                >
                                    <Background color="var(--border-default)" gap={16} size={1} />
                                    <Controls showZoom={false} showInteractive={false} />
                                </ReactFlow>
                            </ReactFlowProvider>
                        )}

                        {activeTab === 'dependencies' && (
                            <ReactFlowProvider>
                                <ReactFlow
                                    nodes={dependencyNodes}
                                    edges={dependencyEdges}
                                    nodeTypes={mockNodeTypes}
                                    onNodeClick={(_, node) => setSelectedNodeInfo(node.data)}
                                    fitView
                                    zoomOnScroll={false}
                                    panOnDrag={false}
                                    zoomOnDoubleClick={false}
                                    style={{ background: 'var(--bg-inset)' }}
                                >
                                    <Background color="var(--border-default)" gap={16} size={1} />
                                    <Controls showZoom={false} showInteractive={false} />
                                </ReactFlow>
                            </ReactFlowProvider>
                        )}

                        {activeTab === 'execution' && (
                            <ReactFlowProvider>
                                <ReactFlow
                                    nodes={executionNodes}
                                    edges={executionEdges}
                                    nodeTypes={mockNodeTypes}
                                    onNodeClick={(_, node) => setSelectedNodeInfo(node.data)}
                                    fitView
                                    zoomOnScroll={false}
                                    panOnDrag={false}
                                    zoomOnDoubleClick={false}
                                    style={{ background: 'var(--bg-inset)' }}
                                >
                                    <Background color="var(--border-default)" gap={16} size={1} />
                                    <Controls showZoom={false} showInteractive={false} />
                                </ReactFlow>
                            </ReactFlowProvider>
                        )}

                        {activeTab === 'symbols' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', height: '100%', background: 'var(--bg-default)' }}>
                                {/* Search List */}
                                <div style={{ borderRight: '1px solid var(--border-default)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div style={{ position: 'relative' }}>
                                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="text"
                                            value={symbolQuery}
                                            onChange={(e) => setSymbolQuery(e.target.value)}
                                            placeholder="Search class or function..."
                                            style={{ width: '100%', padding: '8px 10px 8px 30px', fontSize: 12, borderRadius: 6, border: '1px solid var(--border-default)', background: 'var(--bg-subtle)', outline: 'none' }}
                                        />
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                        {filteredSymbols.map(sym => (
                                            <button
                                                key={sym.name}
                                                onClick={() => setSelectedSymbol(sym)}
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: 6, border: 'none', background: selectedSymbol.name === sym.name ? 'var(--bg-subtle)' : 'transparent', textAlign: 'left', cursor: 'pointer' }}
                                            >
                                                <div>
                                                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{sym.name}</div>
                                                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{sym.path}</div>
                                                </div>
                                                <ChevronRight size={12} color="var(--text-muted)" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Symbol Details Inspector */}
                                <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
                                    <div>
                                        <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', padding: '2px 6px', borderRadius: 4, background: 'var(--bg-subtle)', border: '1px solid var(--border-muted)', color: 'var(--text-secondary)' }}>
                                            {selectedSymbol.type} Definition
                                        </span>
                                        <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginTop: 6 }}>{selectedSymbol.name}</h3>
                                        <p style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: 2 }}>{selectedSymbol.path}</p>
                                    </div>

                                    <div style={{ padding: 14, borderRadius: 8, background: 'var(--bg-inset)', border: '1px solid var(--border-default)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>
                                            <Play size={10} className="text-emerald-500" />
                                            Symbol Documentation
                                        </div>
                                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                                            {selectedSymbol.docstring}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Outgoing Dependencies ({selectedSymbol.dependencies.length})</h4>
                                        {selectedSymbol.dependencies.length > 0 ? (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                                {selectedSymbol.dependencies.map(dep => (
                                                    <span key={dep} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 4, background: 'var(--bg-subtle)', border: '1px solid var(--border-muted)', color: 'var(--text-primary)' }}>
                                                        {dep}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>No direct class dependencies mapped.</span>
                                        )}
                                    </div>

                                    <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>AST documentation synchronized.</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
