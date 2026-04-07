import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
    return {
        dispatch: vi.fn(async () => undefined),
        navigate: vi.fn(),
        searchParams: new URLSearchParams(),
        authState: {
            isLoading: false,
            error: null as string | null,
            isAuthenticated: false,
        },
        clearError: vi.fn(() => ({ type: 'auth/clearError' })),
        checkAuthOnLoad: vi.fn(() => ({ type: 'auth/checkAuthOnLoad' })),
        getMe: vi.fn(() => ({ type: 'auth/getMe' })),
        login: vi.fn((payload: { email: string; password: string }) => ({
            type: 'auth/login',
            payload,
        })),
    }
})

vi.mock('../store/hooks', () => ({
    useAppDispatch: () => mocks.dispatch,
    useAppSelector: (selector: any) => selector({ auth: mocks.authState }),
}))

vi.mock('../store/slices/authSlice', () => ({
    clearError: mocks.clearError,
    checkAuthOnLoad: mocks.checkAuthOnLoad,
    getMe: mocks.getMe,
    login: mocks.login,
}))

vi.mock('../services/api', () => ({
    API_BASE_URL: 'https://api.example.com',
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<any>('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mocks.navigate,
        useSearchParams: () => [mocks.searchParams],
        Link: ({ to, children }: { to: string; children: any }) => <a href={to}>{children}</a>,
    }
})

import Login from './Login'

describe('Login page unit logic', () => {
    beforeEach(() => {
        mocks.dispatch.mockClear()
        mocks.navigate.mockClear()
        mocks.clearError.mockClear()
        mocks.checkAuthOnLoad.mockClear()
        mocks.getMe.mockClear()
        mocks.login.mockClear()

        mocks.authState.isLoading = false
        mocks.authState.error = null
        mocks.authState.isAuthenticated = false
        mocks.searchParams = new URLSearchParams()

        localStorage.clear()
        window.history.replaceState({}, '', '/login')
    })

    it('dispatches clearError on mount', () => {
        render(<Login />)

        expect(mocks.clearError).toHaveBeenCalledTimes(1)
        expect(mocks.dispatch).toHaveBeenCalledWith({ type: 'auth/clearError' })
    })

    it('handles OAuth token by persisting token, dispatching auth checks, and navigating to return path', async () => {
        mocks.searchParams = new URLSearchParams('access_token=oauth-token&returnTo=%2Fprojects')

        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')
        render(<Login />)

        await waitFor(() => {
            expect(setItemSpy).toHaveBeenCalledWith('access_token', 'oauth-token')
            expect(mocks.checkAuthOnLoad).toHaveBeenCalledTimes(1)
            expect(mocks.getMe).toHaveBeenCalledTimes(1)
            expect(mocks.navigate).toHaveBeenCalledWith('/projects', { replace: true })
        })
    })

    it('sanitizes non-relative returnTo during OAuth handling', async () => {
        mocks.searchParams = new URLSearchParams('access_token=oauth-token&returnTo=https%3A%2F%2Fevil.example.com')

        render(<Login />)

        await waitFor(() => {
            expect(mocks.navigate).toHaveBeenCalledWith('/dashboard', { replace: true })
        })
    })

    it('submits login only when both email and password are provided', async () => {
        render(<Login />)

        fireEvent.change(screen.getByLabelText('Email'), {
            target: { value: 'dev@example.com' },
        })
        fireEvent.change(screen.getByLabelText('Password'), {
            target: { value: 'StrongPass123!' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

        await waitFor(() => {
            expect(mocks.login).toHaveBeenCalledWith({
                email: 'dev@example.com',
                password: 'StrongPass123!',
            })
            expect(mocks.dispatch).toHaveBeenCalledWith({
                type: 'auth/login',
                payload: { email: 'dev@example.com', password: 'StrongPass123!' },
            })
        })
    })

    it('does not dispatch login when required fields are empty', async () => {
        render(<Login />)

        fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

        await waitFor(() => {
            expect(mocks.login).not.toHaveBeenCalled()
        })
    })

    it('redirects authenticated users to returnTo path', async () => {
        mocks.authState.isAuthenticated = true
        mocks.searchParams = new URLSearchParams('returnTo=%2Frepositories')

        render(<Login />)

        await waitFor(() => {
            expect(mocks.navigate).toHaveBeenCalledWith('/repositories', { replace: true })
        })
    })
})
