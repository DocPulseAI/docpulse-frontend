import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    dispatch: vi.fn(async () => undefined),
    navigate: vi.fn(),
    searchParams: new URLSearchParams(),
    authState: {
        isLoading: false,
        error: null as string | null,
        isAuthenticated: false,
    },
    clearError: vi.fn(() => ({ type: 'auth/clearError' })),
    signup: vi.fn((payload: any) => ({ type: 'auth/signup', payload })),
}))

vi.mock('../store/hooks', () => ({
    useAppDispatch: () => mocks.dispatch,
    useAppSelector: (selector: any) => selector({ auth: mocks.authState }),
}))

vi.mock('../store/slices/authSlice', () => ({
    clearError: mocks.clearError,
    signup: mocks.signup,
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

import Signup from './Signup'

describe('Signup page unit logic', () => {
    beforeEach(() => {
        mocks.dispatch.mockReset()
        mocks.navigate.mockReset()
        mocks.clearError.mockClear()
        mocks.signup.mockClear()
        mocks.authState.isLoading = false
        mocks.authState.error = null
        mocks.authState.isAuthenticated = false
        mocks.searchParams = new URLSearchParams()
    })

    it('dispatches clearError on mount', () => {
        render(<Signup />)
        expect(mocks.clearError).toHaveBeenCalledTimes(1)
    })

    it('shows validation errors on empty submit', async () => {
        render(<Signup />)
        fireEvent.submit(document.querySelector('form.auth-dev-email-form') as HTMLFormElement)

        expect(await screen.findByText('Full name is required')).not.toBeNull()
        expect(screen.getByText('Email is required')).not.toBeNull()
        expect(screen.getByText('Password is required')).not.toBeNull()
    })

    it('prevents submit on password mismatch', async () => {
        render(<Signup />)

        fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Test User' } })
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'StrongPass123!' } })
        fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'WrongPass' } })
        fireEvent.submit(document.querySelector('form.auth-dev-email-form') as HTMLFormElement)

        expect(await screen.findByText('Passwords do not match')).not.toBeNull()
        expect(mocks.signup).not.toHaveBeenCalled()
    })

    it('dispatches signup with valid payload', async () => {
        render(<Signup />)

        fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Test User' } })
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@example.com' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'StrongPass123!' } })
        fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'StrongPass123!' } })
        fireEvent.submit(document.querySelector('form.auth-dev-email-form') as HTMLFormElement)

        await waitFor(() => {
            expect(mocks.signup).toHaveBeenCalledWith({
                username: 'Test User',
                email: 'test@example.com',
                password: 'StrongPass123!',
            })
        })
    })

    it('redirects authenticated users with safe returnTo', async () => {
        mocks.authState.isAuthenticated = true
        mocks.searchParams = new URLSearchParams('returnTo=%2Fprojects')

        render(<Signup />)

        await waitFor(() => {
            expect(mocks.navigate).toHaveBeenCalledWith('/projects', { replace: true })
        })
    })

    it('sanitizes invalid returnTo to /dashboard', async () => {
        mocks.authState.isAuthenticated = true
        mocks.searchParams = new URLSearchParams('returnTo=https%3A%2F%2Fevil.com')

        render(<Signup />)

        await waitFor(() => {
            expect(mocks.navigate).toHaveBeenCalledWith('/dashboard', { replace: true })
        })
    })
})
