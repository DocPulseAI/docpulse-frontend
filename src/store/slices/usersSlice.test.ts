import { describe, it, expect } from 'vitest'

import reducer, { clearUsersError, createUser, deleteUser, fetchUsers, updateUserRole } from './usersSlice'

describe('usersSlice reducer', () => {
    it('fetchUsers fulfilled replaces users list', () => {
        const initial = reducer(undefined, { type: '@@INIT' })
        const users = [
            {
                id: 'u1',
                email: 'a@example.com',
                username: 'alice',
                role: 'admin' as const,
                is_active: true,
                has_github: true,
                created_at: '2026-01-01',
            },
        ]

        const state = reducer(initial, fetchUsers.fulfilled(users, 'req-1', undefined))

        expect(state.users).toEqual(users)
        expect(state.isLoading).toBe(false)
    })

    it('createUser fulfilled appends user', () => {
        const initial = reducer(undefined, { type: '@@INIT' })
        const user = {
            id: 'u2',
            email: 'b@example.com',
            username: 'bob',
            role: 'user' as const,
            is_active: true,
            has_github: false,
            created_at: '2026-01-02',
        }

        const state = reducer(
            initial,
            createUser.fulfilled(user, 'req-2', {
                email: 'b@example.com',
                password: 'secret',
                username: 'bob',
                role: 'user',
            })
        )

        expect(state.users).toHaveLength(1)
        expect(state.users[0].id).toBe('u2')
    })

    it('updateUserRole fulfilled updates matching user only', () => {
        const previous = {
            users: [
                {
                    id: 'u1',
                    email: 'a@example.com',
                    username: 'alice',
                    role: 'user' as const,
                    is_active: true,
                    has_github: true,
                    created_at: '2026-01-01',
                },
                {
                    id: 'u2',
                    email: 'b@example.com',
                    username: 'bob',
                    role: 'user' as const,
                    is_active: true,
                    has_github: false,
                    created_at: '2026-01-02',
                },
            ],
            isLoading: false,
            error: null as string | null,
        }

        const updated = {
            ...previous.users[1],
            role: 'admin' as const,
        }

        const state = reducer(previous, updateUserRole.fulfilled(updated, 'req-3', { userId: 'u2', role: 'admin' }))

        expect(state.users[0].role).toBe('user')
        expect(state.users[1].role).toBe('admin')
    })

    it('deleteUser fulfilled removes user by id', () => {
        const previous = {
            users: [
                {
                    id: 'u1',
                    email: 'a@example.com',
                    username: 'alice',
                    role: 'admin' as const,
                    is_active: true,
                    has_github: true,
                    created_at: '2026-01-01',
                },
            ],
            isLoading: false,
            error: null as string | null,
        }

        const state = reducer(previous, deleteUser.fulfilled('u1', 'req-4', 'u1'))

        expect(state.users).toHaveLength(0)
    })

    it('clearUsersError clears error state', () => {
        const previous = {
            users: [],
            isLoading: false,
            error: 'boom',
        }

        const state = reducer(previous, clearUsersError())
        expect(state.error).toBeNull()
    })
})
