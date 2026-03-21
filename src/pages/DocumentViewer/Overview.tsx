import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { documentsApi } from '../../services/api'
import MarkdownRenderer from '../../components/MarkdownRenderer'

export default function DocumentOverview() {
    const { id, commit } = useParams<{ id: string; commit: string }>()

    const [readmeContent, setReadmeContent] = useState<string | null>(null)
    const [summaryContent, setSummaryContent] = useState<string | null>(null)
    const [healthContent, setHealthContent] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            if (!id || !commit) return
            setIsLoading(true)
            try {
                const [readmeR, summaryR, healthR] = await Promise.allSettled([
                    documentsApi.getReadme(id, commit),
                    documentsApi.getSummary(id, commit),
                    documentsApi.getHealthReport(id, commit)
                ])

                if (readmeR.status === 'fulfilled') setReadmeContent(readmeR.value.data.content)
                if (summaryR.status === 'fulfilled') setSummaryContent(summaryR.value.data.content)
                if (healthR.status === 'fulfilled') setHealthContent(healthR.value.data.content)
            } finally {
                setIsLoading(false)
            }
        }
        load()
    }, [id, commit])

    if (isLoading) {
        return <div className="cr-loading"><div className="cr-spinner" /></div>
    }

    return (
        <div className="cr-page">
            <div className="cr-grid-2">
                <section className="cr-card">
                    <div className="cr-card-header">
                        <h3 className="cr-card-title">Documentation Overview</h3>
                    </div>
                    <div className="cr-card-body portal-markdown cr-markdown-small">
                        <MarkdownRenderer content={readmeContent || summaryContent || '# No overview available'} />
                    </div>
                </section>

                <section className="cr-card">
                    <div className="cr-card-header">
                        <h3 className="cr-card-title">Documentation Health</h3>
                    </div>
                    <div className="cr-card-body portal-markdown cr-markdown-small">
                        <MarkdownRenderer content={healthContent || 'No documentation health report found.'} />
                    </div>
                </section>
            </div>
        </div>
    )
}
