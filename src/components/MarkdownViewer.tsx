import React from 'react'
import MarkdownRenderer from './MarkdownRenderer'

interface MarkdownViewerProps {
    content: string
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
    return (
        <div className="markdown-viewer-container p-4 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 overflow-auto max-h-full">
            <MarkdownRenderer content={content} />
        </div>
    )
}

export default MarkdownViewer
