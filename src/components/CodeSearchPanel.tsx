import React, { useEffect, useState, useRef } from 'react'
import { Search, Loader2, FileCode2, X } from 'lucide-react'
import { intelligenceApi } from '../services/api'

interface SymbolItem {
    name: string
    type: string
    file: string
    line: number | null
}

interface CodeSearchPanelProps {
    projectId: string
    commitHash: string
    externalQuery?: string
    compact?: boolean
}

const CodeSearchPanel: React.FC<CodeSearchPanelProps> = ({ projectId, commitHash, externalQuery, compact }) => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SymbolItem[]>([])
    const [loading, setLoading] = useState(false)
    const [analysisUnavailable, setAnalysisUnavailable] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (externalQuery !== undefined) {
            setQuery(externalQuery)
            if (externalQuery) setIsOpen(true)
        }
    }, [externalQuery])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        if (compact) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [compact])

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!projectId || !commitHash) return
            if (compact && !query.trim()) {
                setResults([])
                return
            }
            setLoading(true)
            try {
                const response = await intelligenceApi.getSymbols(projectId, commitHash, query || undefined)
                const data = response.data
                if (data?.status === 'analysis_not_available') {
                    setAnalysisUnavailable(true)
                    setResults([])
                    return
                }
                setAnalysisUnavailable(false)
                const symbols = Array.isArray(data?.symbols) ? data.symbols : []
                setResults(symbols)
            } catch {
                setResults([])
            } finally {
                setLoading(false)
            }
        }, 250)

        return () => clearTimeout(timer)
    }, [projectId, commitHash, query, compact])

    const visibleResults = results.slice(0, 60)
    const hasMoreResults = results.length > visibleResults.length

    if (compact) {
        return (
            <div ref={wrapperRef} style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
                <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            setIsOpen(true)
                        }}
                        onFocus={() => setIsOpen(true)}
                        placeholder="Search symbols..."
                        style={{ width: '100%', padding: '6px 12px 6px 36px', fontSize: 13, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', background: 'var(--bg-subtle)', outline: 'none' }}
                    />
                    {loading && <Loader2 size={14} className="cr-spinner" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)' }} />}
                    {!loading && query && (
                        <button onClick={() => { setQuery(''); setIsOpen(false) }} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                            <X size={12} color="var(--text-muted)" />
                        </button>
                    )}
                </div>

                {isOpen && query.trim() && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, background: 'var(--bg-default)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', zIndex: 50, maxHeight: 400, overflowY: 'auto' }}>
                        {analysisUnavailable ? (
                            <div className="cr-doc-empty" style={{ padding: 16 }}>Analysis not available</div>
                        ) : results.length === 0 && !loading ? (
                            <div className="cr-doc-empty" style={{ padding: 16 }}>No symbols found</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {visibleResults.map((symbol, index) => (
                                    <div key={`${symbol.name}-${symbol.type}-${index}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)', gap: 12 }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                                <FileCode2 size={12} color="var(--text-muted)" />
                                                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{symbol.name}</span>
                                                <span style={{ fontSize: 10, padding: '2px 6px', background: 'var(--bg-subtle)', borderRadius: 4, color: 'var(--text-secondary)' }}>{symbol.type}</span>
                                            </div>
                                            <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-mono)' }}>{symbol.file}</span>
                                        </div>
                                        <span className="cr-severity cr-severity--info" style={{ fontSize: 10 }}>L{symbol.line ?? '-'}</span>
                                    </div>
                                ))}
                                {hasMoreResults && (
                                    <div style={{ padding: '8px 12px', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', background: 'var(--bg-subtle)' }}>
                                        Showing {visibleResults.length} results. Refine your search.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="cr-card">
            <div className="cr-card-header" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h4 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Code Search</h4>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Repository symbols and API surfaces</span>
                </div>
                <span className="cr-severity cr-severity--info">{results.length} found</span>
            </div>

            <div className="cr-card-body" style={{ padding: 20 }}>
                <div style={{ position: 'relative', marginBottom: 16 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search symbols, controllers, services, entities..."
                        style={{ width: '100%', padding: '10px 12px 10px 36px', fontSize: 14, borderRadius: 'var(--radius-md)', border: '1px solid var(--border-default)', background: 'var(--bg-subtle)', outline: 'none' }}
                    />
                    {loading && <Loader2 size={16} className="cr-spinner" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)' }} />}
                </div>

                {analysisUnavailable ? (
                    <div className="cr-doc-empty">Analysis not available for this commit.</div>
                ) : (
                    <div style={{ border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', maxHeight: 500, overflowY: 'auto' }}>
                        {results.length === 0 ? (
                            <div className="cr-doc-empty" style={{ padding: 32 }}>No symbols found for this commit.</div>
                        ) : (
                            <div className="cr-settings-list" style={{ border: 'none', borderRadius: 0 }}>
                                {visibleResults.map((symbol, index) => (
                                    <div key={`${symbol.name}-${symbol.type}-${index}`} className="cr-settings-row">
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                                                <FileCode2 size={14} color="var(--text-muted)" />
                                                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{symbol.name}</span>
                                                <span style={{ fontSize: 11, padding: '2px 6px', background: 'var(--bg-subtle)', borderRadius: 4, color: 'var(--text-secondary)' }}>{symbol.type}</span>
                                            </div>
                                            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{symbol.file}</span>
                                        </div>
                                        <span className="cr-severity cr-severity--info">L{symbol.line ?? '-'}</span>
                                    </div>
                                ))}
                                {hasMoreResults && (
                                    <div style={{ padding: 12, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', background: 'var(--bg-subtle)', borderTop: '1px solid var(--border-default)' }}>
                                        Showing first {visibleResults.length} results. Refine query for more precise matches.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CodeSearchPanel
