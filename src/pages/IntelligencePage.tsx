import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import DashboardLayout from '../components/DashboardLayout'
import ArchitectureGraph from '../components/ArchitectureGraph'
import ExecutionFlow from '../components/ExecutionFlow'
import MarkdownViewer from '../components/MarkdownViewer'
import SearchBar from '../components/SearchBar'
import { intelligenceApi } from '../services/api'
import { useIntelligenceViewResolver } from '../hooks/useIntelligenceViewResolver'
import IntelligenceStatusBadge from '../components/IntelligenceStatusBadge'

interface IntelligencePageProps {
    type: 'overview' | 'architecture' | 'dependencies' | 'execution-flow' | 'api' | 'impact' | 'adr'
}

const IntelligencePage: React.FC<IntelligencePageProps> = ({ type }) => {
    const { id: routeId } = useParams<{ id?: string }>()
    const currentProject = useAppSelector((state) => state.projects.currentProject)
    const projectId = routeId || currentProject?.id

    // For demo/standalone purposes, we might need a default commit if not provided
    // In a real app, this would come from a version selector
    const {
        commitHash,
        activeView,
        state: viewState,
        loading: viewLoading,
        error: viewError,
    } = useIntelligenceViewResolver(projectId)
    const [content, setContent] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchContent = async () => {
            if (!projectId || !commitHash) return
            setLoading(true)
            try {
                let response
                switch (type) {
                    case 'overview':
                        response = await intelligenceApi.getDocs(projectId, commitHash, 'README.md')
                        break
                    case 'api':
                        response = await intelligenceApi.getDocs(projectId, commitHash, 'docs/api/api-reference.md')
                        break
                    case 'impact':
                        response = await intelligenceApi.getReport(projectId, commitHash)
                        break
                    case 'adr':
                        response = await intelligenceApi.getDocs(projectId, commitHash, 'docs/adr/0001-record-architecture-decisions.md')
                        break
                    case 'dependencies':
                        response = await intelligenceApi.getDependencies(projectId, commitHash)
                        break
                }

                if (response) {
                    setContent(response.data)
                }
            } catch (err) {
                console.error(`Failed to fetch ${type} content:`, err)
            } finally {
                setLoading(false)
            }
        }
        fetchContent()
    }, [projectId, commitHash, type])

    const renderContent = () => {
        if (!projectId || !commitHash) {
            return <div className="p-8 text-center text-slate-500">Please select a project to view intelligence data.</div>
        }

        if (viewLoading || loading) return <div className="p-8 text-center">Loading {type}...</div>
        if (viewError) return <div className="p-8 text-center text-slate-500">{viewError}</div>

        switch (type) {
            case 'overview':
                return <MarkdownViewer content={typeof content === 'string' ? content : JSON.stringify(content, null, 2)} />
            case 'architecture':
                return <ArchitectureGraph projectId={projectId} commitHash={commitHash} />
            case 'dependencies':
                return <div className="h-full"><ArchitectureGraph projectId={projectId} commitHash={commitHash} type="dependencies" /></div>
            case 'execution-flow':
                return <ExecutionFlow projectId={projectId} commitHash={commitHash} />
            case 'api':
                return <MarkdownViewer content={typeof content === 'string' ? content : 'API Documentation not found'} />
            case 'impact':
                return <MarkdownViewer content={JSON.stringify(content, null, 2)} />
            case 'adr':
                return <MarkdownViewer content={typeof content === 'string' ? content : 'ADR not found'} />
            default:
                return <div>Unknown type</div>
        }
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full space-y-4 p-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{type.replace('-', ' ')}</h1>
                    <SearchBar projectId={projectId || ''} commitHash={commitHash} />
                </div>
                {activeView && (
                    <div className="text-sm text-slate-500 flex items-center gap-2">
                        <IntelligenceStatusBadge state={viewState as any} />
                        <span>{activeView.refName} at {activeView.commitHash.substring(0, 7)}</span>
                    </div>
                )}
                <div className="flex-1 min-h-0">
                    {renderContent()}
                </div>
            </div>
        </DashboardLayout>
    )
}

export default IntelligencePage
