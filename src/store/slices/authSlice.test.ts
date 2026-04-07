import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

type StorageMap = Map<string, string>

const makeLocalStorage = (seed?: Record<string, string>) => {
    const store: StorageMap = new Map(Object.entries(seed || {}))
    return {
        getItem: vi.fn((key: string) => (store.has(key) ? store.get(key)! : null)),
        setItem: vi.fn((key: string, value: string) => {
            store.set(key, String(value))
        }),
        removeItem: vi.fn((key: string) => {
            store.delete(key)
        }),
        clear: vi.fn(() => {
            store.clear()
        }),
    }
}

const loadModule = async (seed?: Record<string, string>) => {
    vi.resetModules()
    const localStorageMock = makeLocalStorage(seed)
    vi.stubGlobal('localStorage', localStorageMock)
    const mod = await import('./authSlice')
    return { ...mod, localStorageMock }
}

describe('authSlice reducer', () => {
    beforeEach(() => {
        vi.restoreAllMocks()
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('initializes authenticated state from persisted token', async () => {
        const { default: reducer } = await loadModule({ access_token: 'persisted-token' })
        const state = reducer(undefined, { type: '@@INIT' })

        expect(state.accessToken).toBe('persisted-token')
        expect(state.isAuthenticated).toBe(true)
    })

    it('checkAuthOnLoad reads token and sets auth state', async () => {
        const { default: reducer, checkAuthOnLoad, localStorageMock } = await loadModule({ access_token: 'abc' })

        let state = reducer(undefined, { type: '@@INIT' })
        state = reducer(state, checkAuthOnLoad())

        expect(localStorageMock.getItem).toHaveBeenCalledWith('access_token')
        expect(state.accessToken).toBe('abc')
        expect(state.isAuthenticated).toBe(true)
    })

    it('login fulfilled persists token and user', async () => {
        const { default: reducer, login, localStorageMock } = await loadModule()
        const payload = {
            access_token: 'jwt-token',
            user: {
                id: 'u1',
                email: 'u@example.com',
                username: 'user',
                role: 'user' as const,
                is_active: true,
                has_github: false,
                created_at: '2026-01-01T00:00:00Z',
            },
        }

        const state = reducer(undefined, login.fulfilled(payload, 'req-1', { email: 'u@example.com', password: 'secret' }))

        expect(state.user?.id).toBe('u1')
        expect(state.accessToken).toBe('jwt-token')
        expect(state.isAuthenticated).toBe(true)
        expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'jwt-token')
    })

    it('getMe rejected clears auth and removes token', async () => {
        const { default: reducer, getMe, localStorageMock } = await loadModule({ access_token: 'old-token' })

        const previous = {
            ...reducer(undefined, { type: '@@INIT' }),
            user: {
                id: 'u1',
                email: 'u@example.com',
                username: 'user',
                role: 'user' as const,
                is_active: true,
                has_github: true,
                created_at: '2026-01-01T00:00:00Z',
            },
            isAuthenticated: true,
            accessToken: 'old-token',
        }

        const state = reducer(previous, getMe.rejected(new Error('401'), 'req-2'))

        expect(state.user).toBeNull()
        expect(state.accessToken).toBeNull()
        expect(state.isAuthenticated).toBe(false)
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token')
    })

    it('logout fulfilled always clears otp and token state', async () => {
        const { default: reducer, logout, localStorageMock } = await loadModule({ access_token: 'old-token' })

        const previous = {
            ...reducer(undefined, { type: '@@INIT' }),
            otpEmail: 'u@example.com',
            otpSent: true,
            isAuthenticated: true,
            accessToken: 'old-token',
        }

        const state = reducer(previous, logout.fulfilled(null, 'req-3', undefined))

        expect(state.isAuthenticated).toBe(false)
        expect(state.accessToken).toBeNull()
        expect(state.otpEmail).toBeNull()
        expect(state.otpSent).toBe(false)
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token')
    })
})
