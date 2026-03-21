import React from 'react'
import { MermaidBlock } from './MarkdownRenderer'

interface MermaidDiagramProps {
    code: string
}

const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code }) => {
    return (
        <div className="mermaid-diagram-container p-4 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-auto max-h-full">
            <MermaidBlock code={code} />
        </div>
    )
}

export default MermaidDiagram
