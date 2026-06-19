import { useEffect, useState, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { documentsApi } from '../../services/api'
import { getDataModelGraph, collectDetailedDataModels, DetailedDataModelEntity } from '../../utils/documentPayloads'
import InteractiveGraph from '../../components/InteractiveGraph'
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from '@tanstack/react-table'
import { Layout, Table as TableIcon, Database, ExternalLink } from 'lucide-react'

const columnHelper = createColumnHelper<DetailedDataModelEntity>()

export default function DocumentDataModel() {
    const { id, commit } = useParams<{ id: string; commit: string }>()
    const [graphData, setGraphData] = useState<any>(null)
    const [tableData, setTableData] = useState<DetailedDataModelEntity[]>([])
    const [view, setView] = useState<'graph' | 'table'>('graph')
    const [isLoading, setIsLoading] = useState(true)

    const columns = useMemo(() => [
        columnHelper.accessor('name', {
            header: 'Entity Name',
            cell: info => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Database size={14} className="cr-text-muted" />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{info.getValue()}</span>
                </div>
            ),
        }),
        columnHelper.accessor('fields', {
            header: 'Fields',
            cell: info => {
                const fields = info.getValue() || []
                return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {fields.slice(0, 5).map(f => (
                            <span key={f.name} style={{
                                fontSize: '10px', padding: '1px 6px', borderRadius: '4px',
                                background: 'var(--bg-subtle)', border: '1px solid var(--border-subtle)',
                                color: 'var(--text-muted)'
                            }}>
                                {f.name}: {f.type}{f.required ? '*' : ''}
                            </span>
                        ))}
                        {fields.length > 5 && (
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', padding: '1px' }}>
                                +{fields.length - 5} more
                            </span>
                        )}
                    </div>
                )
            },
        }),
        columnHelper.accessor('relationships', {
            header: 'Relationships',
            cell: info => {
                const rels = info.getValue() || []
                return (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {rels.map((r, i) => (
                            <span key={i} style={{
                                fontSize: '10px', padding: '1px 6px', borderRadius: '4px',
                                background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)',
                                border: '1px solid rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', gap: 4
                            }}>
                                {r.type || 'relates to'} <ExternalLink size={8} /> {r.target}
                            </span>
                        ))}
                    </div>
                )
            },
        }),
        columnHelper.accessor('source_file', {
            header: 'Source File',
            cell: info => (
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                    {info.getValue() || 'n/a'}
                </span>
            ),
        }),
    ], [])

    const table = useReactTable({
        data: tableData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    useEffect(() => {
        const load = async () => {
            if (!id || !commit) return
            try {
                const res = await documentsApi.getImpactReport(id, commit)
                setGraphData(getDataModelGraph(res.data))
                setTableData(collectDetailedDataModels(res.data))
            } catch (err) {
                console.warn('Data model not found:', err)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [id, commit])

    if (isLoading) return <div className="cr-loading"><div className="cr-spinner" /></div>

    const isEmpty = (!graphData || graphData.nodes.length === 0) && tableData.length === 0

    if (isEmpty) {
        return (
            <div className="cr-page">
                <div className="cr-empty">No entities extracted.</div>
            </div>
        )
    }

    return (
        <div className="cr-page cr-page--flush" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{
                padding: '12px 24px', borderBottom: '1px solid var(--border-subtle)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--bg-default)', zIndex: 10
            }}>
                <div>
                    <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Data Model</h2>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                        {view === 'graph' ? 'Interactive entity-relationship graph' : 'Structured schema overview'}
                    </p>
                </div>
                <div style={{
                    display: 'flex', background: 'var(--bg-subtle)', padding: '2px', borderRadius: '6px',
                    border: '1px solid var(--border-subtle)'
                }}>
                    <button
                        onClick={() => setView('graph')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: '4px',
                            border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 500,
                            background: view === 'graph' ? 'var(--bg-default)' : 'transparent',
                            color: view === 'graph' ? 'var(--text-primary)' : 'var(--text-muted)',
                            boxShadow: view === 'graph' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                    >
                        <Layout size={12} /> Graph
                    </button>
                    <button
                        onClick={() => setView('table')}
                        style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: '4px',
                            border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 500,
                            background: view === 'table' ? 'var(--bg-default)' : 'transparent',
                            color: view === 'table' ? 'var(--text-primary)' : 'var(--text-muted)',
                            boxShadow: view === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                    >
                        <TableIcon size={12} /> Schema Table
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {view === 'graph' ? (
                    <InteractiveGraph data={graphData} type="datamodel" />
                                ) : (
                    <div style={{ height: '100%', overflow: 'auto', padding: '24px 32px' }}>
                        <div className="doc-table-container">
                            <table className="doc-table">
                                <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-subtle)', zIndex: 5 }}>
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
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
