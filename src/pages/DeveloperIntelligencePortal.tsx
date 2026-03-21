import React, { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../store/hooks'
import DashboardLayout from '../components/DashboardLayout'
import CodeSearchPanel from '../components/CodeSearchPanel'
import DependencyGraphViewer from '../components/DependencyGraphViewer'
import CallGraphViewer from '../components/CallGraphViewer'
import ArchitectureGraphViewer from '../components/ArchitectureGraphViewer'
import SequenceDiagramViewer from '../components/SequenceDiagramViewer'
import { intelligenceApi, documentsApi } from '../services/api'
import { useAppDispatch } from '../store/hooks'
import { fetchProjects } from '../store/slices/projectsSlice'
import { Clock, Hash, Book, ChevronRight, Sparkles, Layers, GitFork, Workflow, Search, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const DeveloperIntelligencePortal: React.FC = () => {
    const { id: routeId } = useParams<{ id?: string }>()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const { currentProject, projects, isLoading: projectsLoading } = useAppSelector((state) => state.projects)
    const projectId = routeId || currentProject?.id || searchParams.get('projectId')

    const [commitHash, setCommitHash] = useState<string>(searchParams.get('sha') || '')
    const [searchQuery, setSearchQuery] = useState('')

    const handleSymbolSearch = (label: string) => {
        setSearchQuery(label)
        // Scroll to search panel
        const searchEl = document.getElementById('symbols')
        if (searchEl) {
            searchEl.scrollIntoView({ behavior: 'smooth' })
        }
    }

    useEffect(() => {
        if (projects.length === 0) {
            dispatch(fetchProjects())
        }
    }, [dispatch, projects.length])

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        // Reset commit hash when project changes to avoid showing stale graphs from the previous project
        setCommitHash(searchParams.get('sha') || '')
    }, [projectId])

    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!projectId || !commitHash) return
            setLoading(true)
            setError(null)
            try {
                // Consolidated fetching: getReport and getCommitAnalysis use the same endpoint
                const res = await intelligenceApi.getReport(projectId, commitHash)
                if (res.data?.status === 'analysis_not_available') {
                    setError('Analysis not available for this commit.')
                }
            } catch (err: any) {
                console.error('Failed to fetch analysis:', err)
                setError(err.response?.data?.detail || err.message || 'Failed to load intelligence data')
            } finally {
                setLoading(false)
            }
        }
        fetchAnalysis()
    }, [projectId, commitHash])

    useEffect(() => {
        const fetchLatestCommit = async () => {
            // Only fetch if we don't have a commit hash for the current project
            if (!projectId || commitHash) return
            try {
                const docsRes = await documentsApi.list(projectId)
                if (docsRes.data && docsRes.data.documents && docsRes.data.documents.length > 0) {
                    setCommitHash(docsRes.data.documents[0].commit)
                }
            } catch (err) {
                console.error('Failed to fetch latest commit:', err)
            }
        }
        fetchLatestCommit()
    }, [projectId, commitHash])

    if (!projectId) {
        return (
            <DashboardLayout>
                <div className="p-12 max-w-4xl mx-auto">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4">
                            <Sparkles size={32} />
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Select a Project</h1>
                        <p className="text-slate-500">Choose a project to view its intelligence dashboard and commit analysis.</p>
                    </div>

                    {projectsLoading ? (
                        <div className="flex justify-center p-12">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {projects.map((project) => (
                                <motion.button
                                    key={project.id}
                                    whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                                    onClick={() => navigate(`/intelligence?projectId=${project.id}`)}
                                    className="flex items-center p-4 bg-white rounded-xl border border-slate-200 text-left transition-all hover:border-blue-300 group"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors mr-4">
                                        <Book size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-900 truncate">{project.name}</h3>
                                        <p className="text-xs text-slate-500 truncate">{project.githubUrl?.replace('https://github.com/', '')}</p>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-400" />
                                </motion.button>
                            ))}
                        </div>
                    )}

                    {projects.length === 0 && !projectsLoading && (
                        <div className="text-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                            <p className="text-slate-500 mb-4">You haven't added any projects yet.</p>
                            <button
                                onClick={() => navigate('/repositories')}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Add Your First Project
                            </button>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout>
            <div className="flex flex-col h-full bg-[var(--bg-canvas)]">
                {/* Header */}
                <div className="bg-[var(--bg-default)] border-b border-[var(--border-default)] px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10 shadow-sm backdrop-blur-md bg-opacity-80">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Sparkles size={20} className="text-blue-600" />
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                Developer Intelligence Portal
                            </h1>
                        </div>
                        <p className="text-slate-500 text-sm">
                            Deep-dive architectural analysis, system boundaries, and execution intelligence.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {loading && (
                            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider animate-pulse">
                                <Clock size={12} />
                                Analyzing...
                            </div>
                        )}
                        <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                            <div className="flex items-center text-xs font-mono text-slate-500">
                                <Hash size={12} className="mr-1" />
                                {commitHash.substring(0, 7) || 'HEAD'}
                            </div>
                            {!loading && (
                                <>
                                    <div className="h-4 w-px bg-slate-200" />
                                    <div className="flex items-center text-xs font-bold text-emerald-600 uppercase tracking-wider">
                                        Active
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-500 font-medium tracking-wide">Synthesizing intelligence artifacts...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full p-12">
                            <AlertCircle size={48} className="text-slate-300 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-600">{error}</h3>
                            <p className="text-slate-400 text-sm mt-1 text-center max-w-md">
                                We couldn't find the necessary artifacts for this commit. Architectural insights may not be available.
                            </p>
                        </div>
                    ) : (
                        <div className="p-8 space-y-12 max-w-[1600px] mx-auto w-full">
                            {/* 1. Architecture Reconstruction */}
                            <section id="architecture">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <Layers size={18} />
                                        </div>
                                        1. Architecture Reconstruction
                                    </h2>
                                    <p className="text-slate-500 text-sm mt-1 ml-10">
                                        Unified system knowledge map and structural sequence visualization.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                    <div className="xl:col-span-2 cr-analysis-card intel-panel min-h-[600px]">
                                        <div className="intel-panel-header">
                                            <div className="intel-panel-title-wrap">
                                                <h4>Structural Knowledge Map</h4>
                                                <span className="intel-panel-subtitle">Interactive entity relationship and boundary visualization</span>
                                            </div>
                                        </div>
                                        <div className="intel-panel-body p-0 h-[540px]">
                                            <ArchitectureGraphViewer
                                                projectId={projectId}
                                                commitHash={commitHash}
                                                onNodeClick={handleSymbolSearch}
                                            />
                                        </div>
                                    </div>
                                    <div className="cr-analysis-card intel-panel min-h-[600px]">
                                        <div className="intel-panel-header">
                                            <div className="intel-panel-title-wrap">
                                                <h4>Layered Sequence</h4>
                                                <span className="intel-panel-subtitle">Tiered architectural boundaries</span>
                                            </div>
                                        </div>
                                        <div className="intel-panel-body p-0 min-h-[540px]">
                                            <SequenceDiagramViewer
                                                projectId={projectId}
                                                commitHash={commitHash}
                                                path="docs/architecture/architecture_sequence.mermaid"
                                                title="Architecture Sequence"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 2. System Dependencies */}
                            <section id="dependencies">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                            <GitFork size={18} />
                                        </div>
                                        2. System Dependencies
                                    </h2>
                                    <p className="text-slate-500 text-sm mt-1 ml-10">
                                        Module-level coupling and dependency cycle detection.
                                    </p>
                                </div>

                                <div className="cr-analysis-card intel-panel min-h-[500px]">
                                    <div className="intel-panel-header">
                                        <div className="intel-panel-title-wrap">
                                            <h4>Module Coupling Graph</h4>
                                            <span className="intel-panel-subtitle">High-level dependency map between components</span>
                                        </div>
                                    </div>
                                    <div className="intel-panel-body p-0 h-[440px]">
                                        <DependencyGraphViewer
                                            projectId={projectId}
                                            commitHash={commitHash}
                                            onNodeClick={handleSymbolSearch}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* 3. Execution Intelligence */}
                            <section id="execution">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                                            <Workflow size={18} />
                                        </div>
                                        3. Execution Intelligence
                                    </h2>
                                    <p className="text-slate-500 text-sm mt-1 ml-10">
                                        Request flow analysis and controller-to-service call paths.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                                    <div className="cr-analysis-card intel-panel min-h-[500px]">
                                        <div className="intel-panel-header">
                                            <div className="intel-panel-title-wrap">
                                                <h4>Execution Flow Sequence</h4>
                                                <span className="intel-panel-subtitle">Dynamic request trace visualization</span>
                                            </div>
                                        </div>
                                        <div className="intel-panel-body p-0 min-h-[440px]">
                                            <SequenceDiagramViewer
                                                projectId={projectId}
                                                commitHash={commitHash}
                                                path="docs/intelligence/execution_flow.mermaid"
                                                title="Execution Flow"
                                            />
                                        </div>
                                    </div>
                                    <div className="cr-analysis-card intel-panel min-h-[500px]">
                                        <div className="intel-panel-header">
                                            <div className="intel-panel-title-wrap">
                                                <h4>Inter-Module Call Map</h4>
                                                <span className="intel-panel-subtitle">Functional call graph analysis</span>
                                            </div>
                                        </div>
                                        <div className="intel-panel-body p-0 h-[440px]">
                                            <CallGraphViewer
                                                projectId={projectId}
                                                commitHash={commitHash}
                                                onNodeClick={handleSymbolSearch}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 4. Symbol Intelligence Table */}
                            <section id="symbols" className="pb-20">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                            <Search size={18} />
                                        </div>
                                        4. Symbol Intelligence
                                    </h2>
                                    <p className="text-slate-500 text-sm mt-1 ml-10">
                                        Searchable index of all classes, functions, and interfaces.
                                    </p>
                                </div>
                                <CodeSearchPanel
                                    projectId={projectId}
                                    commitHash={commitHash}
                                    externalQuery={searchQuery}
                                />
                            </section>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}

export default DeveloperIntelligencePortal
