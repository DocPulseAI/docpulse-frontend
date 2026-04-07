import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    token: 'token-123',
    resetPassword: vi.fn(),
}))

vi.mock('../services/api', () => ({
    authApi: {
        resetPassword: mocks.resetPassword,
    },
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<any>('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mocks.navigate,
        useParams: () => ({ token: mocks.token }),
        Link: ({ to, children }: { to: string; children: any }) => <a href={to}>{children}</a>,
    }
})

import ResetPassword from './ResetPassword'

describe('ResetPassword unit logic', () => {
    beforeEach(() => {
        vi.useRealTimers()
        mocks.navigate.mockReset()
        mocks.resetPassword.mockReset()
        mocks.token = 'token-123'
    })

    it('validates password mismatch and prevents submit', async () => {
        render(<ResetPassword />)

        fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'StrongPass123!' } })
        fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'WrongPass' } })
        fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

        expect(await screen.findByText('Passwords do not match')).not.toBeNull()
        expect(mocks.resetPassword).not.toHaveBeenCalled()
    })

    it('shows invalid token error when route token is missing', async () => {
        mocks.token = ''
        render(<ResetPassword />)

        fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'StrongPass123!' } })
        fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'StrongPass123!' } })
        fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

        expect(await screen.findByText('Invalid reset token')).not.toBeNull()
    })

    it('submits reset request and navigates on success', async () => {
        mocks.resetPassword.mockResolvedValueOnce({})
        render(<ResetPassword />)

        fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'StrongPass123!' } })
        fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'StrongPass123!' } })
        fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

        await waitFor(() => {
            expect(mocks.resetPassword).toHaveBeenCalledWith({
                token: 'token-123',
                password: 'StrongPass123!',
                confirmPassword: 'StrongPass123!',
            })
            expect(screen.getByText('Password Reset Successful')).not.toBeNull()
        })

        await new Promise((resolve) => setTimeout(resolve, 3100))
        expect(mocks.navigate).toHaveBeenCalledWith('/login')
    }, 10000)

    it('shows API error message on failure', async () => {
        mocks.resetPassword.mockRejectedValueOnce({
            response: { data: { detail: 'Reset link expired' } },
        })
        render(<ResetPassword />)

        fireEvent.change(screen.getByLabelText('New Password'), { target: { value: 'StrongPass123!' } })
        fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'StrongPass123!' } })
        fireEvent.click(screen.getByRole('button', { name: 'Reset Password' }))

        expect(await screen.findByText('Reset link expired')).not.toBeNull()
    })
})
