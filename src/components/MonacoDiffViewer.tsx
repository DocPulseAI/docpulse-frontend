import { DiffEditor } from '@monaco-editor/react'
import { useEffect, useState } from 'react'

interface MonacoDiffViewerProps {
    original: string
    modified: string
    language?: string
    /** Optional label for left and right panels */
    originalLabel?: string
    modifiedLabel?: string
}

/**
 * Monaco Diff Editor — full-height, split view, line numbers, syntax highlighting,
 * inline diff markers, scroll sync. No outer card, clean surface.
 */
export default function MonacoDiffViewer({
    original, modified, language = 'markdown',
    originalLabel = 'Previous', modifiedLabel = 'Current'
}: MonacoDiffViewerProps) {
    const [theme, setTheme] = useState<'vs-dark' | 'vs'>('vs-dark')

    // Sync theme with document theme
    useEffect(() => {
        const check = () => {
            const t = document.documentElement.getAttribute('data-theme')
            setTheme(t === 'light' ? 'vs' : 'vs-dark')
        }
        check()
        const obs = new MutationObserver(check)
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
        return () => obs.disconnect()
    }, [])

    return (
        <div className="doc-diff-editor">
            <div className="doc-diff-labels">
                <span className="doc-diff-label doc-diff-label--old">{originalLabel}</span>
                <span className="doc-diff-label doc-diff-label--new">{modifiedLabel}</span>
            </div>
            <div className="doc-diff-container">
                <DiffEditor
                    original={original}
                    modified={modified}
                    language={language}
                    theme={theme}
                    options={{
                        readOnly: true,
                        renderSideBySide: true,
                        minimap: { enabled: false },
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
                        renderOverviewRuler: false,
                        overviewRulerBorder: false,
                        scrollbar: {
                            verticalScrollbarSize: 6,
                            horizontalScrollbarSize: 6,
                        },
                        diffWordWrap: 'on',
                        padding: { top: 8, bottom: 8 },
                    }}
                />
            </div>
        </div>
    )
}
