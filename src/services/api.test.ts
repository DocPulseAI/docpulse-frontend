import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
    let requestSuccess: ((config: any) => any) | undefined
    let requestError: ((error: any) => any) | undefined
    let responseSuccess: ((response: any) => any) | undefined
    let responseError: ((error: any) => any) | undefined

    const instance = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        interceptors: {
            request: {
                use: vi.fn((onSuccess: any, onError: any) => {
                    requestSuccess = onSuccess
                    requestError = onError
                    return 0
                }),
            },
            response: {
                use: vi.fn((onSuccess: any, onError: any) => {
                    responseSuccess = onSuccess
                    responseError = onError
                    return 0
                }),
            },
        },
    }

    return {
        instance,
        axiosCreate: vi.fn(() => instance),
        getRequestSuccess: () => requestSuccess,
        getRequestError: () => requestError,
        getResponseSuccess: () => responseSuccess,
        getResponseError: () => responseError,
    }
})

vi.mock('axios', () => ({
    default: {
        create: mocks.axiosCreate,
    },
}))

describe('api service unit logic', () => {
    beforeEach(async () => {
        vi.resetModules()
        mocks.axiosCreate.mockClear()
        mocks.instance.get.mockReset()
        mocks.instance.post.mockReset()
        mocks.instance.put.mockReset()
        mocks.instance.patch.mockReset()
        mocks.instance.delete.mockReset()

        localStorage.clear()
        window.history.replaceState({}, '', '/dashboard')
    })

    it('creates axios instance with JSON headers', async () => {
        await import('./api')

        expect(mocks.axiosCreate).toHaveBeenCalledTimes(1)
        expect(mocks.axiosCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                baseURL: expect.any(String),
                headers: {
                    'Content-Type': 'application/json',
                },
            })
        )
    })

    it('request interceptor attaches bearer token when present', async () => {
        await import('./api')

        const interceptor = mocks.getRequestSuccess()
        expect(interceptor).toBeTypeOf('function')

        localStorage.setItem('access_token', 'jwt-123')
        const config = interceptor!({ headers: {} })

        expect(config.headers.Authorization).toBe('Bearer jwt-123')
    })

    it('request interceptor keeps config unchanged when token is absent', async () => {
        await import('./api')

        const interceptor = mocks.getRequestSuccess()
        const config = { headers: {} }
        const result = interceptor!(config)

        expect(result).toBe(config)
        expect(result.headers.Authorization).toBeUndefined()
    })

    it('response interceptor clears token on 401 and rejects error', async () => {
        await import('./api')

        // Keep current route at /login to avoid jsdom navigation side effects in unit tests.
        window.history.replaceState({}, '', '/login')
        localStorage.setItem('access_token', 'jwt-123')
        const removeSpy = vi.spyOn(Storage.prototype, 'removeItem')

        const rejector = mocks.getResponseError()
        const error = { response: { status: 401 } }

        await expect(rejector!(error)).rejects.toBe(error)
        expect(removeSpy).toHaveBeenCalledWith('access_token')
    })

    it('authApi.login maps to POST /auth/login', async () => {
        const { authApi } = await import('./api')

        const payload = { email: 'dev@example.com', password: 'secret' }
        await authApi.login(payload)

        expect(mocks.instance.post).toHaveBeenCalledWith('/auth/login', payload)
    })

    it('projectsApi.update maps to PUT /projects/:id', async () => {
        const { projectsApi } = await import('./api')

        await projectsApi.update('proj-1', { name: 'Renamed' })

        expect(mocks.instance.put).toHaveBeenCalledWith('/projects/proj-1', { name: 'Renamed' })
    })

    it('intelligenceApi.getSummary builds path under /api/intelligence', async () => {
        const { intelligenceApi } = await import('./api')

        await intelligenceApi.getSummary('proj-1', 'abc123')

        const [pathArg, optionsArg] = mocks.instance.get.mock.calls[0]
        expect(pathArg).toMatch(/\/api\/intelligence\/summary$/)
        expect(optionsArg).toEqual({
            params: { projectId: 'proj-1', commitHash: 'abc123' },
        })
    })

    it('documentsApi.search normalizes missing snippet and matchCount from matches', async () => {
        const { documentsApi } = await import('./api')

        mocks.instance.post.mockResolvedValueOnce({
            data: {
                projectId: 'proj-1',
                projectName: 'Proj',
                query: 'login',
                results: [
                    {
                        commit: 'abc123',
                        metadata: {
                            version: '1.0.0',
                            branch: 'main',
                            commit: 'abc123',
                            commitUrl: '',
                            branchUrl: '',
                            tags: [],
                            createdAt: '',
                            updatedAt: '',
                            title: '',
                        },
                        matches: ['first hit', 'second hit'],
                    },
                ],
            },
        })

        const response = await documentsApi.search('proj-1', 'login')

        expect(mocks.instance.post).toHaveBeenCalledWith('/projects/proj-1/documents/search', { query: 'login' })
        expect(response.data.results[0].snippet).toBe('first hit')
        expect(response.data.results[0].matchCount).toBe(2)
    })
})
