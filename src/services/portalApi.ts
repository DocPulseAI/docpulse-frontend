// Intelligence Portal API — all 7 section endpoints
import api from './api'

const portalPath = (path: string) => `/api/intelligence/portal${path}`
const withParams = (projectId: string, commitHash: string) =>
    ({ params: { projectId, commitHash } })

export interface PortalOverview {
    projectId: string
    commitHash: string
    metrics: {
        riskScore: number | null
        riskLevel: string
        docCoverage: number | null
        driftScore: number | null
        breakingChangesCount: number
        apiCount: number
    }
    aiSummaryMarkdown: string | null
    aiSummaryJson: any | null
    breakingChanges: any[]
}

export interface PortalArchFile {
    name: string
    path: string
    content: string
    isMermaid: boolean
}

export interface DepEdge { from: string; to: string }

export interface PortalDeps {
    status?: string
    totalModules: number
    totalDependencies: number
    circularDependencies: string[][]
    modules: string[]
    dependencies: DepEdge[]
    truncated: boolean
}

export interface ApiEndpoint {
    method: string
    path: string
    file: string
    line: number | null
    controller: string
    description: string
}

export interface ApiGroup {
    resource: string
    count: number
    endpoints: ApiEndpoint[]
}

export interface PortalApis {
    total: number
    groups: ApiGroup[]
}

export interface PortalChanges {
    commitHash: string
    riskScore: number | null
    riskLevel: string
    breakingChanges: any[]
    files: Array<{
        name: string
        additions: number | null
        deletions: number | null
        riskLevel: string
        reason: string
    }>
    impactedModules: string[]
    recommendations: string[]
    driftIssues: any[]
}

export interface PortalDoc {
    name: string
    type: string
    path: string
    available: boolean
}

export const portalApi = {
    getOverview: (projectId: string, commitHash: string) =>
        api.get<PortalOverview>(portalPath('/overview'), withParams(projectId, commitHash)),

    getArchitecture: (projectId: string, commitHash: string) =>
        api.get<{ files: PortalArchFile[]; total: number }>(portalPath('/architecture'), withParams(projectId, commitHash)),

    getDependencies: (projectId: string, commitHash: string, limit = 40) =>
        api.get<PortalDeps>(portalPath('/dependencies'), { params: { projectId, commitHash, limit } }),

    getApis: (projectId: string, commitHash: string) =>
        api.get<PortalApis>(portalPath('/apis'), withParams(projectId, commitHash)),

    getCallFlow: (projectId: string, commitHash: string) =>
        api.get<{ files: PortalArchFile[]; total: number }>(portalPath('/callflow'), withParams(projectId, commitHash)),

    getChanges: (projectId: string, commitHash: string) =>
        api.get<PortalChanges>(portalPath('/changes'), withParams(projectId, commitHash)),

    getDocs: (projectId: string, commitHash: string) =>
        api.get<{ docs: PortalDoc[]; total: number }>(portalPath('/docs'), withParams(projectId, commitHash)),
}
