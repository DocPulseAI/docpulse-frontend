// ═══════════════════════════════════════════════
// Team Types — DocPulse AI
// ═══════════════════════════════════════════════

export type TeamRole = 'owner' | 'admin' | 'member'

export type MemberStatus = 'active' | 'invited'

export interface TeamMember {
    id: string
    userId?: string
    name: string
    email: string
    role: TeamRole
    status: MemberStatus
    avatarUrl?: string
    lastActive?: string
    joinedAt: string
}

export interface TeamActivity {
    id: string
    type: 'invite' | 'role_change' | 'remove' | 'join' | 'review' | 'commit'
    actor: string
    target?: string
    detail: string
    timestamp: string
}

export interface InvitePayload {
    email: string
    role: TeamRole
}

/** Role metadata for display and permissions */
export const ROLE_META: Record<TeamRole, {
    label: string
    description: string
    color: 'purple' | 'blue' | 'green' | 'gray'
    permissions: string[]
}> = {
    owner: {
        label: 'Owner',
        description: 'Full access',
        color: 'purple',
        permissions: ['manage_team', 'manage_settings', 'edit_docs', 'review', 'read'],
    },
    admin: {
        label: 'Admin',
        description: 'Manage team and settings',
        color: 'blue',
        permissions: ['manage_team', 'manage_settings', 'edit_docs', 'review', 'read'],
    },
    member: {
        label: 'Member',
        description: 'Project contributor',
        color: 'green',
        permissions: ['edit_docs', 'review', 'read'],
    },
}

/** Example mock data for development */
export const MOCK_TEAM_MEMBERS: TeamMember[] = [
    {
        id: 'tm-1',
        userId: 'u-1',
        name: 'Kireeti',
        email: 'kireeti@docpulse.ai',
        role: 'owner',
        status: 'active',
        lastActive: new Date().toISOString(),
        joinedAt: '2025-11-15T08:00:00Z',
    },
    {
        id: 'tm-2',
        userId: 'u-2',
        name: 'Arjun Mehta',
        email: 'arjun@docpulse.ai',
        role: 'admin',
        status: 'active',
        lastActive: new Date(Date.now() - 3600_000).toISOString(),
        joinedAt: '2025-12-01T10:30:00Z',
    },
    {
        id: 'tm-3',
        userId: 'u-3',
        name: 'Priya Sharma',
        email: 'priya@docpulse.ai',
        role: 'member',
        status: 'active',
        lastActive: new Date(Date.now() - 86400_000).toISOString(),
        joinedAt: '2026-01-10T14:00:00Z',
    },
    {
        id: 'tm-4',
        userId: 'u-4',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'member',
        status: 'active',
        lastActive: new Date(Date.now() - 172800_000).toISOString(),
        joinedAt: '2026-01-22T09:15:00Z',
    },
    {
        id: 'tm-5',
        name: 'Sarah Kim',
        email: 'sarah@company.io',
        role: 'member',
        status: 'invited',
        joinedAt: new Date(Date.now() - 86400_000).toISOString(),
    },
]

export const MOCK_TEAM_ACTIVITY: TeamActivity[] = [
    {
        id: 'ta-1',
        type: 'invite',
        actor: 'Kireeti',
        target: 'Sarah Kim',
        detail: 'Kireeti invited Sarah Kim to the project as Reviewer',
        timestamp: new Date(Date.now() - 86400_000).toISOString(),
    },
    {
        id: 'ta-2',
        type: 'review',
        actor: 'Priya Sharma',
        detail: 'Priya Sharma reviewed commit 8cf843',
        timestamp: new Date(Date.now() - 172800_000).toISOString(),
    },
    {
        id: 'ta-3',
        type: 'role_change',
        actor: 'Kireeti',
        target: 'Arjun Mehta',
        detail: 'Kireeti changed Arjun Mehta\'s role to Maintainer',
        timestamp: new Date(Date.now() - 259200_000).toISOString(),
    },
    {
        id: 'ta-4',
        type: 'join',
        actor: 'John Doe',
        detail: 'John Doe joined the project',
        timestamp: new Date(Date.now() - 345600_000).toISOString(),
    },
    {
        id: 'ta-5',
        type: 'commit',
        actor: 'Arjun Mehta',
        detail: 'Arjun Mehta pushed 3 commits to main',
        timestamp: new Date(Date.now() - 432000_000).toISOString(),
    },
]
