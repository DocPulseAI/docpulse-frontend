import React, { useEffect, useState } from 'react'
import { MermaidBlock } from './MarkdownRenderer'
import { intelligenceApi } from '../services/api'
import { Layers } from 'lucide-react'

interface SequenceDiagramViewerProps {
    projectId: string
    commitHash: string
    path: string
    title: string
}

const SequenceDiagramViewer: React.FC<SequenceDiagramViewerProps> = ({ projectId, commitHash, path, title }) => {
    const [code, setCode] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchDiagram = async () => {
            if (!projectId || !commitHash || !path) return
            setLoading(true)
            try {
                const response = await intelligenceApi.getDiagram(projectId, commitHash, path)
                if (response.data) {
                    setCode(response.data)
                } else {
                    setError('Diagram data not found')
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load diagram')
            } finally {
                setLoading(false)
            }
        }

        fetchDiagram()
    }, [projectId, commitHash, path])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <span className="text-slate-500 text-sm font-medium">Rendering {title}...</span>
            </div>
        )
    }

    if (error || !code) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <Layers size={32} className="text-slate-300 mb-4" />
                <span className="text-slate-400 text-sm italic">
                    {error || `No sequence diagram available for ${title}`}
                </span>
            </div>
        )
    }

    return (
        <div className="sequence-viewer-container">
            <MermaidBlock code={code} />
        </div>
    )
}

export default SequenceDiagramViewer
