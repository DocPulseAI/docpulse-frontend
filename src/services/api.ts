import axios, { type InternalAxiosRequestConfig } from 'axios'

// Build the API URL from environment variables
// VITE_API_URL takes priority, otherwise construct from VITE_API_BASE + VITE_API_HOSTPORT
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  if (import.meta.env.VITE_API_HOSTPORT) {
    const base = import.meta.env.VITE_API_BASE || 'https://'
    return `${base}${import.meta.env.VITE_API_HOSTPORT}`
  }
  // In production, Nginx handles proxying to the backend if the URL is relative (empty string)
  return ''
}

export const API_BASE_URL = getApiBaseUrl()
export const EPIC5_API_BASE_URL = (import.meta.env.VITE_EPIC5_API || '/api').replace(/\/+$/, '')

interface RequestTelemetry {
  requestId: string
  startedAt: number
}

type InstrumentedRequestConfig = InternalAxiosRequestConfig & {
  metadata?: RequestTelemetry
}

const DIAGNOSTICS_LOGS_ENABLED =
  import.meta.env.DEV || String(import.meta.env.VITE_ENABLE_DIAGNOSTICS_LOGS || 'false').toLowerCase() === 'true'
const API_LOG_BODY_MAX_CHARS = Math.max(200, Number(import.meta.env.VITE_API_LOG_BODY_MAX_CHARS || 1200))

const truncateText = (value: string | undefined | null): string => {
  const text = (value || '').trim()
  if (text.length <= API_LOG_BODY_MAX_CHARS) {
    return text
  }
  return `${text.slice(0, API_LOG_BODY_MAX_CHARS)}...(truncated)`
}

const safePreview = (value: unknown): string | undefined => {
  if (value === null || value === undefined) {
    return undefined
  }
  if (typeof value === 'string') {
    return truncateText(value)
  }
  try {
    return truncateText(JSON.stringify(value))
  } catch {
    return truncateText(String(value))
  }
}

const createRequestId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `req-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const logApiEvent = (
  level: 'info' | 'warn' | 'error',
  eventId: string,
  message: string,
  fields: Record<string, unknown> = {}
): void => {
  if (!DIAGNOSTICS_LOGS_ENABLED) {
    return
  }
  const payload = {
    ts: new Date().toISOString(),
    level: level.toUpperCase(),
    service: 'frontend',
    eventId,
    message,
    ...fields,
  }
  console[level](JSON.stringify(payload))
}

logApiEvent('info', 'FRONTEND_API_CLIENT_INIT', 'Initialized frontend API client', {
  apiBaseUrl: API_BASE_URL || '(relative)',
  epic5BaseUrl: EPIC5_API_BASE_URL,
})

const intelligencePath = (path: string) => `${EPIC5_API_BASE_URL}/intelligence${path}`

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - attach access token
api.interceptors.request.use(
  (config) => {
    const instrumentedConfig = config as InstrumentedRequestConfig
    const requestId = createRequestId()
    instrumentedConfig.metadata = { requestId, startedAt: Date.now() }

    const headersWithSet = instrumentedConfig.headers as { set?: (key: string, value: string) => void }
    if (headersWithSet && typeof headersWithSet.set === 'function') {
      headersWithSet.set('X-Request-Id', requestId)
    } else if (instrumentedConfig.headers) {
      ;(instrumentedConfig.headers as unknown as Record<string, string>)['X-Request-Id'] = requestId
    }

    const token = localStorage.getItem('access_token')
    if (token) {
      instrumentedConfig.headers.Authorization = `Bearer ${token}`
    }
    logApiEvent('info', 'FRONTEND_API_REQUEST_START', 'Outgoing API request started', {
      requestId,
      method: (instrumentedConfig.method || 'GET').toString().toUpperCase(),
      url: instrumentedConfig.url,
      baseURL: instrumentedConfig.baseURL,
    })
    return instrumentedConfig
  },
  (error) => {
    logApiEvent('error', 'FRONTEND_API_REQUEST_PREP_FAILED', 'Failed to prepare API request', {
      error: safePreview(error?.message),
    })
    return Promise.reject(error)
  }
)

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => {
    const instrumentedConfig = response.config as InstrumentedRequestConfig
    const requestId = instrumentedConfig.metadata?.requestId
    const durationMs = instrumentedConfig.metadata ? Date.now() - instrumentedConfig.metadata.startedAt : undefined
    logApiEvent('info', 'FRONTEND_API_REQUEST_SUCCESS', 'API request completed', {
      requestId,
      method: (instrumentedConfig.method || 'GET').toString().toUpperCase(),
      url: instrumentedConfig.url,
      statusCode: response.status,
      durationMs,
    })
    return response
  },
  (error) => {
    const instrumentedConfig = (error?.config || {}) as InstrumentedRequestConfig
    const requestId = instrumentedConfig.metadata?.requestId
    const durationMs = instrumentedConfig.metadata ? Date.now() - instrumentedConfig.metadata.startedAt : undefined
    const statusCode = error?.response?.status
    logApiEvent(
      statusCode === 401 ? 'warn' : 'error',
      'FRONTEND_API_REQUEST_FAILED',
      'API request failed',
      {
        requestId,
        method: (instrumentedConfig.method || 'GET').toString().toUpperCase(),
        url: instrumentedConfig.url,
        statusCode,
        durationMs,
        error: safePreview(error?.message),
        responsePreview: safePreview(error?.response?.data),
      }
    )
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('access_token')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  signup: (data: { email: string; password: string; username: string }) =>
    api.post('/auth/signup', data),

  verifyOtp: (data: { email: string; otp: string }) =>
    api.post('/auth/signup/verify_otp', data),

  resendOtp: (email: string) =>
    api.post('/auth/resend_otp', { email }),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  logout: () =>
    api.post('/auth/logout'),

  getMe: () =>
    api.get('/auth/me'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (data: { token: string; password: string; confirmPassword: string }) =>
    api.post('/auth/reset-password', data),

  getGitHubRepos: (params?: { page?: number; per_page?: number; sort?: string }) =>
    api.get('/auth/github/repos', { params }),
}

// Users API (Admin only)
export const usersApi = {
  getAll: () =>
    api.get('/users'),

  create: (data: { email: string; password: string; username: string; role: string }) =>
    api.post('/users', data),

  updateRole: (userId: string, role: string) =>
    api.patch(`/users/${userId}/role`, { role }),

  delete: (userId: string) =>
    api.delete(`/users/${userId}`),
}

// Projects API
export const projectsApi = {
  getAll: () =>
    api.get('/projects'),

  getById: (id: string) =>
    api.get(`/projects/${id}`),

  create: (data: { name: string; description?: string; githubUrl?: string }) =>
    api.post('/projects', data),

  update: (id: string, data: { name?: string; description?: string; githubUrl?: string }) =>
    api.put(`/projects/${id}`, data),

  delete: (id: string) =>
    api.delete(`/projects/${id}`),

  updateSettings: (
    id: string,
    data: { autoGenerateDocs?: boolean; githubAccessToken?: string | null; defaultIntelligenceView?: string; trackedBranches?: string[]; branchProcessingMode?: 'default_only' | 'default_and_tracked' },
  ) =>
    api.put(`/projects/${id}/settings`, data),

  getDefaultIntelligenceView: (id: string) =>
    api.get<{ view: IntelligenceView | null }>(`/projects/${id}/intelligence/default`),

  getIntelligenceViews: (id: string) =>
    api.get<{ defaultViewKey: string; views: IntelligenceView[] }>(`/projects/${id}/intelligence/views`),

  getIntelligenceView: (id: string, viewKey: string) =>
    api.get<{ view: IntelligenceView | null }>(`/projects/${id}/intelligence/view/${encodeURIComponent(viewKey)}`),

  updateIntelligenceSettings: (
    id: string,
    data: { defaultIntelligenceView?: string; trackedBranches?: string[]; branchProcessingMode?: 'default_only' | 'default_and_tracked' },
  ) =>
    api.put(`/projects/${id}/intelligence/settings`, data),

  triggerDocGeneration: (id: string) =>
    api.post<{ message: string; projectId: string; projectName: string; runId?: string }>(`/projects/${id}/generate-docs`),

  inviteMember: (projectId: string, email: string, role: 'owner' | 'admin' | 'member' = 'member') =>
    api.post(`/projects/${projectId}/invite`, { email, role }),

  cancelInvitation: (projectId: string, invitationId: string) =>
    api.delete(`/projects/${projectId}/invite/${invitationId}`),

  updateMemberRole: (projectId: string, memberId: string, role: string) =>
    api.patch(`/projects/${projectId}/members/${memberId}/role`, { role }),

  removeMember: (projectId: string, memberId: string) =>
    api.delete(`/projects/${projectId}/members/${memberId}`),

  getActivity: (projectId: string) =>
    api.get<{ projectId: string; projectName: string; activity: Array<{ id: string; type: string; actor: string; detail: string; timestamp: string }> }>(
      `/projects/${projectId}/activity`
    ),
}

// Invitations API
export const invitationsApi = {
  getDetails: (token: string) =>
    api.get(`/invitations/${token}`),

  accept: (token: string) =>
    api.post(`/invitations/${token}/accept`),

  decline: (token: string) =>
    api.post(`/invitations/${token}/decline`),
}

export interface DashboardStats {
  projects: number
  documentHealth: number
  driftScore: number
  coverage: number
  riskScore: number
  driftTrendChange: number
  coverageTrendChange: number
  riskTrendChange: number
}

export interface IntelligenceView {
  projectId: string
  viewKey: string
  commitHash: string
  refName: string
  refType: 'default_branch' | 'tracked_branch' | 'release' | 'pull_request' | 'ephemeral_preview' | 'feature_branch'
  published: boolean
  publishedAt: string | null
  generatedAt: string | null
  runStatus: 'queued' | 'running' | 'succeeded' | 'failed' | 'partial' | null
  source: 'published' | 'run' | 'legacy'
}

export interface DashboardOverviewResponse {
  stats: DashboardStats
  driftTrend: Array<{ d: string; score: number }>
  coverageTrend: Array<{ m: string; pct: number }>
  breakingChanges: Array<{ w: string; c: number }>
  recentCommits: Array<{ sha: string; msg: string; risk: 'low' | 'medium' | 'high'; time: string }>
  driftFindings: Array<{ area: string; pct: number; severity: 'low' | 'medium' | 'high' | 'critical' }>
  intelligenceSummary?: Array<{
    projectId: string
    projectName: string
    viewKey: string
    refName: string
    refType: IntelligenceView['refType']
    commitSha: string
    published: boolean
    publishedAt: string
    runStatus: NonNullable<IntelligenceView['runStatus']>
    isPreview: boolean
  }>
}

export interface WebhookRun {
  id: string
  projectId: string
  repoUrl: string
  commitSha: string
  branch: string
  event: 'push' | 'manual'
  status: 'RUNNING' | 'SUCCESS' | 'FAILED'
  stages: Array<{ stage: 'epic1' | 'epic2' | 'epic3' | 'epic4'; status: 'RUNNING' | 'SUCCESS' | 'FAILED'; error?: string }>
  createdAt: string
}

export interface DashboardCommit {
  sha: string
  message: string
  author: string
  date: string
  source?: 'published_view'
  viewKey?: string
  runStatus?: 'queued' | 'running' | 'succeeded' | 'failed' | 'partial'
  risk: 'critical' | 'high' | 'medium' | 'low'
  files: Array<{ name: string; severity: 'critical' | 'high' | 'medium' | 'low'; changes: number }>
  summary: string
  impact: string
  breaking: boolean
  breakingDetails?: string
  recommendations: string[]
}

export const dashboardApi = {
  getOverview: (filters?: { projectId?: string; branch?: string; dateFrom?: string; dateTo?: string }) =>
    api.get<DashboardOverviewResponse>('/dashboard/overview', { params: filters }),
  getCommits: (filters?: { projectId?: string; branch?: string; dateFrom?: string; dateTo?: string }) =>
    api.get<{ commits: DashboardCommit[] }>('/dashboard/commits', { params: filters }),
  getDriftHistory: (projectId: string, commit?: string) =>
    api.get<{ projectId: string; points: Array<{ commit: string; updatedAt: string; totalIssues: number; major: number; minor: number; patch: number }> }>(
      '/dashboard/drift-history',
      { params: { projectId, commit } }
    ),
  getDriftCompare: (projectId: string, base: string, target: string) =>
    api.get('/dashboard/drift-compare', { params: { projectId, base, target } }),
  getCiBadges: () =>
    api.get<{ badges: Array<{ projectId: string; status: string; lastCommit: string | null; lastRunAt: string | null }> }>('/dashboard/ci-badges'),
}

export const webhookApi = {
  getRuns: (projectId?: string) =>
    api.get<{ runs: WebhookRun[] }>('/webhooks/runs', { params: { projectId } }),
  retryRun: (runId: string) =>
    api.post(`/webhooks/runs/${runId}/retry`),
}

export interface NotificationItem {
  id: string
  userId: string
  projectId: string
  type: 'mention' | 'comment' | 'pipeline'
  title: string
  message: string
  read: boolean
  createdAt: string
}

export const notificationsApi = {
  list: () =>
    api.get<{ notifications: NotificationItem[] }>('/notifications'),
  markRead: (notificationId: string) =>
    api.post('/notifications/read', { notificationId }),
}

export const integrationsApi = {
  getGithubOrgInstallUrl: () =>
    api.get<{ provider: 'github'; mode: 'organization'; installUrl: string }>('/integrations/github-org/install-url'),
  testGithubAppAuth: () =>
    api.get('/integrations/test-app-auth'),
}

// Document metadata type
export interface DocumentMetadata {
  version: string
  branch: string
  commit: string
  commitUrl: string
  branchUrl: string
  tags: string[]
  createdAt: string
  updatedAt: string
  title: string
  description?: string
}

export interface DocumentComment {
  id: string
  author: string
  role: 'owner' | 'admin' | 'member'
  content: string
  timestamp: string
  line?: number
  filePath?: string
  status?: 'open' | 'resolved'
  assigneeUserId?: string
  resolvedByUserId?: string
  resolvedAt?: string
  replies?: Array<{ id: string; author: string; role: string; content: string; timestamp: string }>
}

// Document with metadata
export interface DocumentVersion {
  commit: string
  metadata: DocumentMetadata | null
}

// Documents list response
export interface DocumentsListResponse {
  projectId: string
  projectName: string
  documents: DocumentVersion[]
}

// Document detail response
export interface DocumentDetailResponse {
  projectId: string
  projectName: string
  commit: string
  content: string
  metadata: DocumentMetadata
}

export interface ArchitectureFile {
  name: string
  content: string
  lastModified: string | null
}

// Search result
export interface SearchResult {
  commit: string
  metadata: DocumentMetadata
  snippet: string
  matchCount: number
}

interface RawSearchResult {
  commit: string
  metadata: DocumentMetadata
  snippet?: string
  matchCount?: number
  matches?: string[]
}

// Filters response
export interface FiltersResponse {
  commits: string[]
  branches: string[]
  tags: string[]
}

// Search response
export interface SearchResponse {
  projectId: string
  projectName: string
  query: string
  results: RawSearchResult[]
}

// Documents API
export const documentsApi = {
  // List all documents for a project
  list: (projectId: string) =>
    api.get<DocumentsListResponse>(`/projects/${projectId}/documents`),

  // Get specific document commit with API content (from docs/api/api-description.json)
  get: (projectId: string, commit: string) =>
    api.get<DocumentDetailResponse>(`/projects/${projectId}/documents/${encodeURIComponent(commit)}`),

  // Get document summary (from docs/summary/summary.md)
  getSummary: (projectId: string, commit: string) =>
    api.get<{ content: string; projectName: string }>(`/projects/${projectId}/documents/${encodeURIComponent(commit)}/summary`),

  // Get document README (from docs/README.generated.md)
  getReadme: (projectId: string, commit: string) =>
    api.get<{ content: string; projectName: string }>(`/projects/${projectId}/documents/${encodeURIComponent(commit)}/readme`),

  // Get architecture files (from docs/architecture/*)
  getArchitecture: (projectId: string, commit: string) =>
    api.get<{ files: ArchitectureFile[]; projectName: string }>(
      `/projects/${projectId}/documents/${encodeURIComponent(commit)}/architecture`
    ),

  // Get dependency files
  getDependencies: (projectId: string, commit: string) =>
    api.get<{ files: ArchitectureFile[]; projectName: string }>(
      `/projects/${projectId}/documents/${encodeURIComponent(commit)}/dependencies`
    ),

  // Get execution flow files
  getExecutionFlow: (projectId: string, commit: string) =>
    api.get<{ files: ArchitectureFile[]; projectName: string }>(
      `/projects/${projectId}/documents/${encodeURIComponent(commit)}/execution-flow`
    ),

  // Get API reference markdown (from docs/api/api-reference.md)
  getApiReference: (projectId: string, commit: string) =>
    api.get<{ content: string; projectName: string }>(
      `/projects/${projectId}/documents/${encodeURIComponent(commit)}/api-reference`
    ),

  // Get ADR files (from docs/adr/*)
  getAdr: (projectId: string, commit: string) =>
    api.get<{ files: ArchitectureFile[]; projectName: string }>(
      `/projects/${projectId}/documents/${encodeURIComponent(commit)}/adr`
    ),

  // Get impact files (from docs/impact/*)
  getImpact: (projectId: string, commit: string) =>
    api.get<{ files: ArchitectureFile[]; projectName: string }>(
      `/projects/${projectId}/documents/${encodeURIComponent(commit)}/impact`
    ),

  // Get documentation health report (from docs/documentation-health.md)
  getHealthReport: (projectId: string, commit: string) =>
    api.get<{ content: string; projectName: string }>(
      `/projects/${projectId}/documents/${encodeURIComponent(commit)}/health-report`
    ),

  // Get tree.txt (from docs/tree.txt)
  getTree: (projectId: string, commit: string) =>
    api.get<{ content: string; projectName: string }>(
      `/projects/${projectId}/documents/${encodeURIComponent(commit)}/tree`
    ),

  // Get doc_snapshot.json (from docs/doc_snapshot.json)
  getSnapshot: (projectId: string, commit: string) =>
    api.get<{ content: any; projectName: string }>(
      `/projects/${projectId}/documents/${encodeURIComponent(commit)}/snapshot`
    ),

  // Get only metadata for a commit
  getMetadata: (projectId: string, commit: string) =>
    api.get<DocumentMetadata>(`/projects/${projectId}/documents/${encodeURIComponent(commit)}/metadata`),

  // Get drift report for a commit
  getDrift: (projectId: string, commit: string) =>
    api.get<{ projectId: string; commit: string; drift: any }>(
      `/projects/${projectId}/documents/${encodeURIComponent(commit)}/drift`
    ),

  // Get impact report for a commit
  getImpactReport: (projectId: string, commit: string) =>
    api.get<{ projectId: string; commit: string; impact: any }>(
      `/projects/${projectId}/documents/${encodeURIComponent(commit)}/impact-report`
    ),

  // Search across all document commits
  search: async (projectId: string, query: string, filters?: { branch?: string; commit?: string; tags?: string[] }) => {
    const response = await api.post<SearchResponse>(`/projects/${projectId}/documents/search`, { query, ...filters })
    const normalizedResults: SearchResult[] = (response.data.results || []).map((result) => {
      const matches = Array.isArray(result.matches) ? result.matches : []
      const snippet = typeof result.snippet === 'string' && result.snippet.length > 0
        ? result.snippet
        : (matches[0] || '')
      const matchCount = typeof result.matchCount === 'number'
        ? result.matchCount
        : matches.length

      return {
        commit: result.commit,
        metadata: result.metadata,
        snippet,
        matchCount,
      }
    })

    return {
      ...response,
      data: {
        ...response.data,
        results: normalizedResults,
      },
    }
  },

  // Update document tags and version (owner/admin only)
  updateTags: (projectId: string, commit: string, tags: string[], version?: string) =>
    api.put(`/projects/${projectId}/documents/${encodeURIComponent(commit)}/tags`, { tags, version }),

  // Get available filter options
  getFilters: (projectId: string) =>
    api.get<FiltersResponse>(`/projects/${projectId}/documents/filters`),

  // Upload a test document (owner/admin only)
  testUpload: (projectId: string, data: {
    commitHash: string
    title: string
    summary?: string
    docs?: Array<{ filename: string; content: string }>
    branch?: string
    description?: string
    tags?: string[]
  }) => api.post(`/projects/${projectId}/documents/test-upload`, data),

  // Delete a document commit (owner/admin only)
  delete: (projectId: string, commit: string) =>
    api.delete(`/projects/${projectId}/documents/${encodeURIComponent(commit)}`),

  // List comments for a document commit
  getComments: (projectId: string, commit: string) =>
    api.get<{ projectId: string; commit: string; comments: DocumentComment[] }>(
      `/projects/${projectId}/documents/${encodeURIComponent(commit)}/comments`
    ),

  // Add comment to a document commit
  addComment: (projectId: string, commit: string, data: { content: string; line?: number }) =>
    api.post<{ projectId: string; commit: string; comment: DocumentComment }>(
      `/projects/${projectId}/documents/${encodeURIComponent(commit)}/comments`,
      data
    ),

  updateComment: (projectId: string, commit: string, commentId: string, data: {
    status?: 'open' | 'resolved'
    assigneeUserId?: string | null
  }) =>
    api.patch(
      `/projects/${projectId}/documents/${encodeURIComponent(commit)}/comments/${commentId}`,
      data
    ),

  unifiedSearch: (projectId: string, data: { query: string; branch?: string; commit?: string; tags?: string[] }) =>
    api.post(`/projects/${projectId}/documents/unified-search`, data),

  exportReport: (projectId: string, commit: string, format: 'json' | 'txt' | 'pdf' = 'json') =>
    api.get(`/projects/${projectId}/documents/${encodeURIComponent(commit)}/export`, {
      params: { format },
      responseType: format === 'json' ? 'json' : 'blob',
    }),
  downloadZip: (projectId: string, commit: string) =>
    api.get(`/projects/${projectId}/documents/${encodeURIComponent(commit)}/download-zip`, {
      responseType: 'blob',
    }),
}

export const intelligenceApi = {
  getCommitAnalysis: (projectId: string, commitHash: string) =>
    api.get(intelligencePath('/report'), { params: { projectId, commitHash } }),

  getReport: (projectId: string, commitHash: string) =>
    api.get(intelligencePath('/report'), { params: { projectId, commitHash } }),

  getArchitecture: (projectId: string, commitHash: string) =>
    api.get(intelligencePath('/architecture'), { params: { projectId, commitHash } }),

  getDependencies: (projectId: string, commitHash: string) =>
    api.get(intelligencePath('/dependencies'), { params: { projectId, commitHash } }),

  getImpact: (projectId: string, commitHash: string) =>
    api.get(intelligencePath('/impact'), { params: { projectId, commitHash } }),

  getSymbols: (projectId: string, commitHash: string, q?: string) =>
    api.get(intelligencePath('/symbols'), { params: { projectId, commitHash, q } }),

  getCallGraph: (projectId: string, commitHash: string) =>
    api.get(intelligencePath('/call-graph'), { params: { projectId, commitHash } }),

  getRepositoryGraph: (projectId: string, commitHash: string) =>
    api.get(intelligencePath('/repository-graph'), { params: { projectId, commitHash } }),

  getSummary: (projectId: string, commitHash: string) =>
    api.get(intelligencePath('/summary'), { params: { projectId, commitHash } }),

  getDrift: (projectId: string, commitHash: string) =>
    api.get(intelligencePath('/drift'), { params: { projectId, commitHash } }),

  getExecutionFlow: (projectId: string, commitHash: string) =>
    api.get(intelligencePath('/execution-flow'), { params: { projectId, commitHash } }),

  getDocs: (projectId: string, commitHash: string, path: string) =>
    api.get(intelligencePath('/docs'), { params: { projectId, commitHash, path } }),

  getDiagram: (projectId: string, commitHash: string, path: string) =>
    api.get(intelligencePath('/diagram'), { params: { projectId, commitHash, path } }),

  search: (projectId: string, commitHash: string, q: string) =>
    api.get(intelligencePath('/search'), { params: { projectId, commitHash, q } }),
}

export default api
