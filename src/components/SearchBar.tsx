import React, { useState, useEffect } from 'react'
import { intelligenceApi } from '../services/api'
import { Search, Loader2 } from 'lucide-react'

interface SearchResult {
    name: string
    type: string
    path?: string
    line?: number
}

interface SearchBarProps {
    projectId: string
    commitHash: string
    onSelect?: (result: SearchResult) => void
}

const SearchBar: React.FC<SearchBarProps> = ({ projectId, commitHash, onSelect }) => {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const search = async () => {
            if (query.length < 2) {
                setResults([])
                return
            }
            setLoading(true)
            try {
                const response = await intelligenceApi.search(projectId, commitHash, query)
                const data = response.data
                if (Array.isArray(data)) {
                    setResults(data)
                    setIsOpen(true)
                    return
                }
                if (data?.status === 'analysis_not_available') {
                    setResults([])
                    setIsOpen(false)
                    return
                }
                const symbols = Array.isArray(data?.symbols) ? data.symbols : []
                setResults(symbols)
                setIsOpen(symbols.length > 0)
            } catch (err) {
                console.error('Search failed:', err)
            } finally {
                setLoading(false)
            }
        }

        const timer = setTimeout(search, 300)
        return () => clearTimeout(timer)
    }, [query, projectId, commitHash])

    return (
        <div className="relative w-full max-w-md mx-auto">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search functions, APIs, modules..."
                    className="w-full h-10 pl-10 pr-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-slate-900 dark:text-slate-100"
                />
                <div className="absolute left-3 top-2.5 text-slate-400">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </div>
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-11 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-80 overflow-auto">
                    {results.map((result, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                if (onSelect) onSelect(result)
                                setIsOpen(false)
                                setQuery('')
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 border-b last:border-0 border-slate-100 dark:border-slate-700"
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-medium text-slate-900 dark:text-slate-100">{result.name}</span>
                                <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-500 silver:text-slate-400">
                                    {result.type}
                                </span>
                            </div>
                            {result.path && (
                                <div className="text-xs text-slate-400 truncate mt-0.5">
                                    {result.path} {result.line ? `:${result.line}` : ''}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SearchBar
