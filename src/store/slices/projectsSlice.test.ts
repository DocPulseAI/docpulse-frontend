import { describe, it, expect } from 'vitest'

import reducer, {
    clearCurrentProject,
    createProject,
    deleteProject,
    inviteMember,
    updateProject,
    updateProjectSettings,
} from './projectsSlice'

describe('projectsSlice reducer', () => {
    it('createProject fulfilled appends project to list', () => {
        const initial = reducer(undefined, { type: '@@INIT' })
        const project = {
            id: 'p1',
            name: 'DocPulse',
            description: null,
            githubUrl: 'https://github.com/acme/docpulse',
            ownerId: 'u1',
            createdAt: '2026-01-01',
            updatedAt: '2026-01-01',
            memberRole: 'owner' as const,
        }

        const state = reducer(initial, createProject.fulfilled(project, 'req-1', {
            name: 'DocPulse',
            githubUrl: 'https://github.com/acme/docpulse',
        }))

        expect(state.projects).toHaveLength(1)
        expect(state.projects[0].id).toBe('p1')
    })

    it('updateProject fulfilled merges values into list and current project', () => {
        const previous = {
            projects: [
                {
                    id: 'p1',
                    name: 'Old',
                    description: null,
                    githubUrl: null,
                    ownerId: 'u1',
                    createdAt: '2026-01-01',
                    updatedAt: '2026-01-01',
                    memberRole: 'owner' as const,
                },
            ],
            currentProject: {
                id: 'p1',
                name: 'Old',
                description: null,
                githubUrl: null,
                ownerId: 'u1',
                createdAt: '2026-01-01',
                updatedAt: '2026-01-01',
                memberRole: 'owner' as const,
            },
            isLoading: false,
            error: null as string | null,
        }

        const updated = { id: 'p1', name: 'New Name', description: 'Updated' }
        const state = reducer(previous, updateProject.fulfilled(updated, 'req-2', { id: 'p1', data: updated }))

        expect(state.projects[0].name).toBe('New Name')
        expect(state.currentProject?.description).toBe('Updated')
    })

    it('deleteProject fulfilled removes from list and clears current project', () => {
        const previous = {
            projects: [
                {
                    id: 'p1',
                    name: 'Delete Me',
                    description: null,
                    githubUrl: null,
                    ownerId: 'u1',
                    createdAt: '2026-01-01',
                    updatedAt: '2026-01-01',
                    memberRole: 'owner' as const,
                },
            ],
            currentProject: {
                id: 'p1',
                name: 'Delete Me',
                description: null,
                githubUrl: null,
                ownerId: 'u1',
                createdAt: '2026-01-01',
                updatedAt: '2026-01-01',
                memberRole: 'owner' as const,
            },
            isLoading: false,
            error: null as string | null,
        }

        const state = reducer(previous, deleteProject.fulfilled('p1', 'req-3', 'p1'))

        expect(state.projects).toHaveLength(0)
        expect(state.currentProject).toBeNull()
    })

    it('inviteMember fulfilled appends invitation into current project', () => {
        const previous = {
            projects: [],
            currentProject: {
                id: 'p1',
                name: 'Project',
                description: null,
                githubUrl: null,
                ownerId: 'u1',
                createdAt: '2026-01-01',
                updatedAt: '2026-01-01',
                memberRole: 'owner' as const,
                pendingInvitations: [],
            },
            isLoading: false,
            error: null as string | null,
        }

        const payload = {
            invitation: {
                id: 'inv1',
                email: 'invitee@example.com',
                status: 'pending',
                createdAt: '2026-01-01',
            },
        }

        const state = reducer(
            previous,
            inviteMember.fulfilled(payload, 'req-4', { projectId: 'p1', email: 'invitee@example.com', role: 'member' })
        )

        expect(state.currentProject?.pendingInvitations).toHaveLength(1)
        expect(state.currentProject?.pendingInvitations?.[0].id).toBe('inv1')
    })

    it('updateProjectSettings fulfilled updates currentProject settings only', () => {
        const previous = {
            projects: [],
            currentProject: {
                id: 'p1',
                name: 'Project',
                description: null,
                githubUrl: null,
                ownerId: 'u1',
                createdAt: '2026-01-01',
                updatedAt: '2026-01-01',
                memberRole: 'owner' as const,
                settings: { autoGenerateDocs: false, hasGithubToken: false },
            },
            isLoading: false,
            error: null as string | null,
        }

        const state = reducer(
            previous,
            updateProjectSettings.fulfilled(
                { id: 'p1', settings: { autoGenerateDocs: true, hasGithubToken: true } },
                'req-5',
                { id: 'p1', data: { autoGenerateDocs: true } }
            )
        )

        expect(state.currentProject?.settings?.autoGenerateDocs).toBe(true)
        expect(state.currentProject?.settings?.hasGithubToken).toBe(true)
    })

    it('clearCurrentProject resets selection', () => {
        const previous = {
            projects: [],
            currentProject: {
                id: 'p1',
                name: 'Project',
                description: null,
                githubUrl: null,
                ownerId: 'u1',
                createdAt: '2026-01-01',
                updatedAt: '2026-01-01',
                memberRole: 'owner' as const,
            },
            isLoading: false,
            error: null as string | null,
        }

        const state = reducer(previous, clearCurrentProject())
        expect(state.currentProject).toBeNull()
    })
})
