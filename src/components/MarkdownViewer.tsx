import React from 'react'
import MarkdownRenderer from './MarkdownRenderer'

interface MarkdownViewerProps {
    content: string
}

const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
    return (
        <div 
            style={{ 
                padding: '24px', 
                background: 'var(--bg-default)', 
                borderRadius: 'var(--radius-lg)', 
                border: '1px solid var(--border-default)', 
                overflow: 'auto', 
                maxHeight: '100%',
                color: 'var(--text-primary)'
            }}
            className="cr-markdown-small"
        >
            <MarkdownRenderer content={content} />
        </div>
    )
}

export default MarkdownViewer
