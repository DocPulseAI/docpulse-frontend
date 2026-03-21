import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { documentsApi, ArchitectureFile } from '../../services/api'
import MarkdownRenderer from '../../components/MarkdownRenderer'
import { Shield } from 'lucide-react'

export default function DocumentAdr() {
    const { id, commit } = useParams<{ id: string; commit: string }>()

    const [adrFiles, setAdrFiles] = useState<ArchitectureFile[]>([])
    const [selectedFile, setSelectedFile] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            if (!id || !commit) return
            setIsLoading(true)
            try {
                const res = await documentsApi.getAdr(id, commit)
                const files = res.data.files || []
                setAdrFiles(files)
                if (files.length > 0) setSelectedFile(files[0].name)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [id, commit])

    if (isLoading) {
        return <div className="cr-loading"><div className="cr-spinner" /></div>
    }

    const fileContent = adrFiles.find((f) => f.name === selectedFile)?.content

    return (
        <div className="cr-two-panel">
            {/* Sidebar for ADR files */}
            <div className="cr-panel-left" style={{ width: 280 }}>
                <div className="cr-panel-header-sticky">
                    <Shield size={14} className="cr-text-muted" />
                    <span className="cr-panel-header-text">Architecture Decisions</span>
                </div>
                <div className="cr-panel-scroll">
                    {adrFiles.length === 0 ? (
                        <div className="cr-list-empty">No ADRs available.</div>
                    ) : (
                        adrFiles.map((file) => (
                            <button
                                key={file.name}
                                className={`cr-commit-row ${selectedFile === file.name ? 'cr-commit-row--active' : ''}`}
                                onClick={() => setSelectedFile(file.name)}
                            >
                                <div className="cr-commit-row-top">
                                    <span className="cr-commit-msg">{file.name}</span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content for Selected ADR */}
            <div className="cr-panel-right">
                <div className="cr-doc-content" style={{ maxWidth: 860, margin: '0 auto', width: '100%' }}>
                    {fileContent ? (
                        <div className="portal-markdown cr-markdown-small">
                            <MarkdownRenderer content={fileContent} />
                        </div>
                    ) : (
                        <div className="cr-list-empty" style={{ paddingTop: 80 }}>
                            Select an ADR from the sidebar to view its details.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
