import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    dispatch: vi.fn(),
    authState: {
        isAuthenticated: false,
        user: null as any,
        isLoading: false,
        accessToken: null as string | null,
    },
    getMe: vi.fn(() => ({ type: 'auth/getMe' })),
}))

vi.mock('../store/hooks', () => ({
    useAppDispatch: () => mocks.dispatch,
    useAppSelector: (selector: any) => selector({ auth: mocks.authState }),
}))

vi.mock('../store/slices/authSlice', () => ({
    getMe: mocks.getMe,
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<any>('react-router-dom')
    return {
        ...actual,
        Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />,
    }
})

import ProtectedRoute from './ProtectedRoute'

describe('ProtectedRoute unit logic', () => {
    beforeEach(() => {
        mocks.dispatch.mockReset()
        mocks.getMe.mockClear()
        mocks.authState.isAuthenticated = false
        mocks.authState.user = null
        mocks.authState.isLoading = false
        mocks.authState.accessToken = null
    })

    it('shows loading spinner when auth is loading', () => {
        mocks.authState.isLoading = true
        render(
            <ProtectedRoute>
                <div>content</div>
            </ProtectedRoute>
        )

        expect(document.querySelector('.spinner')).not.toBeNull()
    })

    it('dispatches getMe when token exists but user missing', async () => {
        mocks.authState.accessToken = 'jwt'
        render(
            <ProtectedRoute>
                <div>content</div>
            </ProtectedRoute>
        )

        await waitFor(() => {
            expect(mocks.getMe).toHaveBeenCalledTimes(1)
            expect(mocks.dispatch).toHaveBeenCalledWith({ type: 'auth/getMe' })
        })
    })

    it('redirects unauthenticated users to /login', () => {
        render(
            <ProtectedRoute>
                <div>content</div>
            </ProtectedRoute>
        )

        expect(screen.getByTestId('navigate').getAttribute('data-to')).toBe('/login')
    })

    it('redirects non-admin from adminOnly route', () => {
        mocks.authState.isAuthenticated = true
        mocks.authState.user = { role: 'user' }

        render(
            <ProtectedRoute adminOnly>
                <div>content</div>
            </ProtectedRoute>
        )

        expect(screen.getByTestId('navigate').getAttribute('data-to')).toBe('/dashboard')
    })

    it('renders children for authenticated users', () => {
        mocks.authState.isAuthenticated = true
        mocks.authState.user = { role: 'admin' }

        render(
            <ProtectedRoute>
                <div>visible-content</div>
            </ProtectedRoute>
        )

        expect(screen.getByText('visible-content')).not.toBeNull()
    })
})
