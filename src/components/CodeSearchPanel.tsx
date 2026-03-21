import React, { useEffect, useState } from 'react'
import { Search, Loader2, FileCode2 } from 'lucide-react'
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
}

const CodeSearchPanel: React.FC<CodeSearchPanelProps> = ({ projectId, commitHash, externalQuery }) => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SymbolItem[]>([])
    const [loading, setLoading] = useState(false)
    const [analysisUnavailable, setAnalysisUnavailable] = useState(false)

    useEffect(() => {
        if (externalQuery !== undefined) {
            setQuery(externalQuery)
        }
    }, [externalQuery])

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (!projectId || !commitHash) return
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
    }, [projectId, commitHash, query])

    const visibleResults = results.slice(0, 60)
    const hasMoreResults = results.length > visibleResults.length

    return (
        <div className="cr-analysis-card intel-panel">
            <div className="cr-analysis-card-header intel-panel-header">
                <div className="intel-panel-title-wrap">
                    <h4>Code Search</h4>
                    <span className="intel-panel-subtitle">Repository symbols and API surfaces</span>
                </div>
                <span className="intel-chip">{results.length}</span>
            </div>

            <div className="intel-panel-body">
                <div className="intel-search-bar">
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search symbols, controllers, services, entities..."
                        className="intel-search-input bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    />
                    <div className="intel-search-icon">
                        {loading ? <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> : <Search className="w-5 h-5" />}
                    </div>
                </div>

                {analysisUnavailable ? (
                    <div className="intel-empty-state">Analysis not available for this commit.</div>
                ) : (
                    <div className="intel-search-results">
                        {results.length === 0 ? (
                            <div className="intel-empty-state">No symbols found for this commit.</div>
                        ) : (
                            <>
                                {visibleResults.map((symbol, index) => (
                                    <div key={`${symbol.name}-${symbol.type}-${index}`} className="intel-search-row">
                                        <div className="intel-search-main">
                                            <div className="intel-search-symbol">
                                                <FileCode2 size={14} />
                                                <span>{symbol.name}</span>
                                            </div>
                                            <span className="intel-search-type">{symbol.type}</span>
                                        </div>
                                        <div className="intel-search-meta">
                                            <span className="intel-search-file">{symbol.file}</span>
                                            <span className="intel-chip">L{symbol.line ?? '-'}</span>
                                        </div>
                                    </div>
                                ))}
                                {hasMoreResults && (
                                    <div className="intel-search-truncate-note">
                                        Showing first {visibleResults.length} results. Refine query for more precise matches.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default CodeSearchPanel
