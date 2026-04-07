import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    forgotPassword: vi.fn(),
}))

vi.mock('../services/api', () => ({
    authApi: {
        forgotPassword: mocks.forgotPassword,
    },
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<any>('react-router-dom')
    return {
        ...actual,
        Link: ({ to, children }: { to: string; children: any }) => <a href={to}>{children}</a>,
    }
})

import ForgotPassword from './ForgotPassword'

describe('ForgotPassword unit logic', () => {
    beforeEach(() => {
        mocks.forgotPassword.mockReset()
    })

    it('validates required email', async () => {
        render(<ForgotPassword />)

        fireEvent.submit(document.querySelector('form') as HTMLFormElement)

        expect(await screen.findByText('Email is required')).not.toBeNull()
    })

    it('validates email format', async () => {
        render(<ForgotPassword />)

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'bad-email' } })
        fireEvent.submit(document.querySelector('form') as HTMLFormElement)

        expect(await screen.findByText('Invalid email format')).not.toBeNull()
    })

    it('shows success state on API success', async () => {
        mocks.forgotPassword.mockResolvedValueOnce({})
        render(<ForgotPassword />)

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'dev@example.com' } })
        fireEvent.submit(document.querySelector('form') as HTMLFormElement)

        await waitFor(() => {
            expect(mocks.forgotPassword).toHaveBeenCalledWith('dev@example.com')
            expect(screen.getByText('Check Your Email')).not.toBeNull()
        })
    })

    it('shows API error message on failure', async () => {
        mocks.forgotPassword.mockRejectedValueOnce({
            response: { data: { detail: 'Email service unavailable' } },
        })
        render(<ForgotPassword />)

        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'dev@example.com' } })
        fireEvent.submit(document.querySelector('form') as HTMLFormElement)

        expect(await screen.findByText('Email service unavailable')).not.toBeNull()
    })
})
