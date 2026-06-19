import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { documentsApi } from '../../services/api'
import Editor from '@monaco-editor/react'
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table'
import Fuse from 'fuse.js'
import { Search, Code } from 'lucide-react'
import { collectApiEndpoints, NormalizedApiEndpoint } from '../../utils/documentPayloads'

interface ApiEndpoint extends NormalizedApiEndpoint {}

const columnHelper = createColumnHelper<ApiEndpoint>()

const columns = [
    columnHelper.accessor('method', {
        header: 'Method',
        cell: info => {
            const m = info.getValue()
            let color = 'var(--text-primary)'
            let bg = 'var(--bg-subtle)'
            if (m === 'GET') { color = 'var(--severity-info)'; bg = 'var(--severity-info-glow)' }
            else if (m === 'POST') { color = 'var(--text-success)'; bg = 'var(--accent-green-soft)' }
            else if (m === 'PUT' || m === 'PATCH') { color = 'var(--text-warning)'; bg = 'var(--severity-medium-glow)' }
            else if (m === 'DELETE') { color = 'var(--text-danger)'; bg = 'var(--severity-critical-glow)' }
            return (
                <span style={{
                    padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 600,
                    backgroundColor: bg, color: color, display: 'inline-block', minWidth: '50px', textAlign: 'center'
                }}>
                    {m}
                </span>
            )
        },
    }),
    columnHelper.accessor('path', {
        header: 'Endpoint Path',
        cell: info => <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{info.getValue()}</span>,
    }),
    columnHelper.accessor('source_file', {
        header: 'Controller / Source',
        cell: info => {
            const endpoint = info.row.original
            return (
                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    {info.getValue() || endpoint.controller || 'Unknown source'}
                </span>
            )
        },
    }),
]

export default function DocumentApiExplorer() {
    const { id, commit } = useParams<{ id: string; commit: string }>()
    const [data, setData] = useState<ApiEndpoint[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [showJson, setShowJson] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const generateSDK = (endpoints: ApiEndpoint[]) => {
        let code = `/**\n * Auto-generated API Client\n * Project: ${id}\n * Commit: ${(commit || '').slice(0, 8)}\n */\n\n`
        code += `import axios from 'axios';\n\n`
        code += `const apiClient = axios.create({\n  baseURL: process.env.API_BASE_URL || 'https://api.example.com',\n  headers: { 'Content-Type': 'application/json' }\n});\n\n`

        // Group by controller/source_file
        const groups: Record<string, ApiEndpoint[]> = {}
        endpoints.forEach(ep => {
            const groupName = (ep.source_file || ep.controller || 'App').split('/').pop()?.split('.')[0] || 'App'
            if (!groups[groupName]) groups[groupName] = []
            groups[groupName].push(ep)
        })

        Object.keys(groups).forEach(group => {
            const cleanGroup = group.replace(/[^a-zA-Z0-9]/g, '')
            code += `// --- ${cleanGroup} Service ---\n\n`
            code += `export const ${cleanGroup}Api = {\n`

            groups[group].forEach(ep => {
                const pathParts = ep.path.split('/').filter(p => p && !p.startsWith(':'))
                const lastPart = pathParts.length > 0 ? pathParts[pathParts.length - 1] : 'root'
                const actionName = lastPart.charAt(0).toUpperCase() + lastPart.slice(1)

                // Keep it clean for the user
                const safeAction = actionName.replace(/[^a-zA-Z0-9]/g, '')
                const funcName = `${ep.method.toLowerCase()}${safeAction}`

                code += `  /**\n   * Route: ${ep.method} ${ep.path}\n   * Source: ${ep.source_file}\n   */\n`
                if (ep.method === 'GET' || ep.method === 'DELETE') {
                    code += `  ${funcName}: (params?: Record<string, any>) => apiClient.${ep.method.toLowerCase()}('${ep.path}', { params }),\n\n`
                } else {
                    code += `  ${funcName}: (data: Record<string, any>) => apiClient.${ep.method.toLowerCase()}('${ep.path}', data),\n\n`
                }
            })
            code += `};\n\n`
        })

        return code
    }

    useEffect(() => {
        const load = async () => {
            if (!id || !commit) return
            try {
                const [impactRes, docRes] = await Promise.allSettled([
                    documentsApi.getImpactReport(id, commit),
                    documentsApi.get(id, commit),
                ])

                const endpoints = collectApiEndpoints(
                    impactRes.status === 'fulfilled' ? impactRes.value.data : undefined,
                    docRes.status === 'fulfilled' ? docRes.value.data : undefined
                )

                setData(endpoints)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [id, commit])

    const fuse = useMemo(() => new Fuse(data, {
        keys: ['method', 'path', 'source_file', 'controller', 'description'],
        threshold: 0.3
    }), [data])

    const filteredData = useMemo(() => {
        if (!searchQuery) return data
        return fuse.search(searchQuery).map(res => res.item)
    }, [searchQuery, data, fuse])

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    if (isLoading) return <div className="cr-loading"><div className="cr-spinner" /></div>

    return (
        <div className="cr-page" style={{ padding: '24px 32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px' }}>API Explorer</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search APIs..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ padding: '6px 12px 6px 32px', borderRadius: '6px', border: '1px solid var(--border-default)', background: 'var(--bg-default)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', width: '240px' }}
                        />
                    </div>
                    <button
                        onClick={() => setShowJson(!showJson)}
                        className={`cr-btn ${showJson ? 'cr-btn-primary' : 'cr-btn-ghost'}`}
                        style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                    >
                        <Code size={14} /> {showJson ? 'View Table' : 'Generate SDK'}
                    </button>
                </div>
            </div>

            <div className="doc-card">
                {showJson ? (
                    <div style={{ height: '600px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                        <Editor
                            height="100%"
                            defaultLanguage="typescript"
                            theme="vs-dark"
                            value={generateSDK(filteredData)}
                            options={{ readOnly: true, minimap: { enabled: false }, fontSize: 13, fontFamily: 'monospace' }}
                        />
                    </div>
                                ) : (
                    <table className="doc-table">
                        <thead>
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map(row => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {table.getRowModel().rows.length === 0 && (
                                <tr><td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No APIs match your search</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
