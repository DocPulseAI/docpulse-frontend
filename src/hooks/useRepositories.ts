import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { createProject } from '../store/slices/projectsSlice'
import { authApi, projectsApi, API_BASE_URL } from '../services/api'

export interface GitHubRepo {
    id: number
    name: string
    fullName: string
    description: string | null
    htmlUrl: string
    private: boolean
    language: string | null
    stargazersCount: number
    forksCount: number
    updatedAt: string
    pushedAt: string
    defaultBranch: string
    owner: {
        login: string
        avatarUrl: string
        type: string
    }
    isAdded: boolean
}

export type SortOption = 'updated' | 'name' | 'stars'
export type FilterOption = 'all' | 'public' | 'private'
export type RepoStatus = 'idle' | 'adding' | 'generating' | 'done' | 'error'

export interface RepoStatusInfo {
    status: RepoStatus
    projectId?: string
    message?: string
}

export interface ToastItem {
    id: string
    type: 'success' | 'error' | 'info'
    title: string
    message: string
    repoName: string
    projectId?: string
}

export const useRepositories = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { user } = useAppSelector((state) => state.auth)

    const [repos, setRepos] = useState<GitHubRepo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<SortOption>('updated')
    const [filterBy, setFilterBy] = useState<FilterOption>('all')
    const [hasGithub, setHasGithub] = useState(true)

    // Enhanced status tracking per repo
    const [repoStatuses, setRepoStatuses] = useState<Record<number, RepoStatusInfo>>({})

    // Toast notifications
    const [toasts, setToasts] = useState<ToastItem[]>([])
    const toastTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

    const addToast = useCallback((toast: Omit<ToastItem, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`
        setToasts(prev => [...prev, { ...toast, id }])
        toastTimeouts.current[id] = setTimeout(() => {
            removeToast(id)
        }, 6000)
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
        if (toastTimeouts.current[id]) {
            clearTimeout(toastTimeouts.current[id])
            delete toastTimeouts.current[id]
        }
    }, [])

    const fetchRepos = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await authApi.getGitHubRepos({ sort: sortBy })
            setRepos(response.data.repos)
            setHasGithub(true)
        } catch (err: any) {
            const status = err.response?.status
            const detail = err.response?.data?.detail || 'Failed to load repositories'
            if (status === 400 || status === 401) {
                setHasGithub(false)
            }
            setError(detail)
        } finally {
            setLoading(false)
        }
    }, [sortBy])

    useEffect(() => {
        fetchRepos()
    }, [fetchRepos])

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            Object.values(toastTimeouts.current).forEach(clearTimeout)
        }
    }, [])

    const handleAddRepo = async (repo: GitHubRepo) => {
        setRepoStatuses(prev => ({ ...prev, [repo.id]: { status: 'adding' } }))
        try {
            const result = await dispatch(
                createProject({
                    name: repo.name,
                    description: repo.description || undefined,
                    githubUrl: repo.htmlUrl,
                })
            )
            if (createProject.fulfilled.match(result)) {
                const projectId = result.payload.id
                const docTriggered = result.payload.docGenerationTriggered

                setRepos((prev) =>
                    prev.map((r) => (r.id === repo.id ? { ...r, isAdded: true } : r))
                )

                if (docTriggered) {
                    setRepoStatuses(prev => ({
                        ...prev,
                        [repo.id]: { status: 'generating', projectId }
                    }))
                    addToast({
                        type: 'info',
                        title: 'Generating documentation',
                        message: `AI is analyzing ${repo.name} and generating docs...`,
                        repoName: repo.name,
                        projectId,
                    })

                    // Simulate generation tracking
                    setTimeout(() => {
                        setRepoStatuses(prev => ({
                            ...prev,
                            [repo.id]: { status: 'done', projectId }
                        }))
                        addToast({
                            type: 'success',
                            title: 'Documentation ready',
                            message: `${repo.name} docs generated successfully!`,
                            repoName: repo.name,
                            projectId,
                        })
                    }, 3000)
                } else {
                    setRepoStatuses(prev => ({
                        ...prev,
                        [repo.id]: { status: 'done', projectId }
                    }))
                    addToast({
                        type: 'success',
                        title: 'Project created',
                        message: `${repo.name} added to your projects.`,
                        repoName: repo.name,
                        projectId,
                    })
                }
            } else {
                setRepoStatuses(prev => ({
                    ...prev,
                    [repo.id]: { status: 'error', message: 'Failed to add' }
                }))
                addToast({
                    type: 'error',
                    title: 'Failed to add',
                    message: `Could not add ${repo.name}. Please try again.`,
                    repoName: repo.name,
                })
            }
        } catch {
            setRepoStatuses(prev => ({
                ...prev,
                [repo.id]: { status: 'error', message: 'Failed to add' }
            }))
        }
    }

    const handleGenerateDocs = async (repo: GitHubRepo) => {
        const repoStatus = repoStatuses[repo.id]
        if (!repoStatus?.projectId) return

        setRepoStatuses(prev => ({
            ...prev,
            [repo.id]: { ...prev[repo.id], status: 'generating' }
        }))

        try {
            await projectsApi.triggerDocGeneration(repoStatus.projectId)
            addToast({
                type: 'info',
                title: 'Regenerating docs',
                message: `AI is re-analyzing ${repo.name}...`,
                repoName: repo.name,
                projectId: repoStatus.projectId,
            })

            setTimeout(() => {
                setRepoStatuses(prev => ({
                    ...prev,
                    [repo.id]: { ...prev[repo.id], status: 'done' }
                }))
            }, 3000)
        } catch {
            setRepoStatuses(prev => ({
                ...prev,
                [repo.id]: { ...prev[repo.id], status: 'error', message: 'Generation failed' }
            }))
        }
    }

    const handleConnectGitHub = () => {
        const returnTo = '/repositories'
        window.location.href = `${API_BASE_URL}/auth/github?returnTo=${encodeURIComponent(returnTo)}`
    }

    // Filter & sort
    const filteredRepos = useMemo(() => {
        return repos
            .filter((r) => {
                if (filterBy === 'public' && r.private) return false
                if (filterBy === 'private' && !r.private) return false
                if (searchQuery) {
                    const q = searchQuery.toLowerCase()
                    return (
                        r.name.toLowerCase().includes(q) ||
                        r.fullName.toLowerCase().includes(q) ||
                        (r.description && r.description.toLowerCase().includes(q))
                    )
                }
                return true
            })
            .sort((a, b) => {
                if (sortBy === 'name') return a.name.localeCompare(b.name)
                if (sortBy === 'stars') return b.stargazersCount - a.stargazersCount
                return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            })
    }, [repos, sortBy, filterBy, searchQuery])

    // Group repos by owner
    const { groupedByOwner, owners } = useMemo(() => {
        const grouped = filteredRepos.reduce<Record<string, GitHubRepo[]>>((acc, repo) => {
            const key = repo.owner.login
            if (!acc[key]) acc[key] = []
            acc[key].push(repo)
            return acc
        }, {})

        const sortedOwners = Object.keys(grouped).sort((a, b) => {
            if (a === user?.username) return -1
            if (b === user?.username) return 1
            return a.localeCompare(b)
        })

        return { groupedByOwner: grouped, owners: sortedOwners }
    }, [filteredRepos, user])

    const addedCount = useMemo(() => repos.filter(r => r.isAdded).length, [repos])
    const availableCount = useMemo(() => repos.filter(r => !r.isAdded).length, [repos])

    return {
        repos,
        loading,
        error,
        hasGithub,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        filterBy,
        setFilterBy,
        repoStatuses,
        toasts,
        removeToast,
        fetchRepos,
        handleAddRepo,
        handleGenerateDocs,
        handleConnectGitHub,
        filteredRepos,
        groupedByOwner,
        owners,
        addedCount,
        availableCount,
        user,
    }
}
