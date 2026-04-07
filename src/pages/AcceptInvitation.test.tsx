import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    navigate: vi.fn(),
    token: 'invite-token',
    authState: {
        isAuthenticated: false,
        user: null as any,
    },
    getDetails: vi.fn(),
    accept: vi.fn(),
    decline: vi.fn(),
}))

vi.mock('../store/hooks', () => ({
    useAppSelector: (selector: any) => selector({ auth: mocks.authState }),
}))

vi.mock('../services/api', () => ({
    invitationsApi: {
        getDetails: mocks.getDetails,
        accept: mocks.accept,
        decline: mocks.decline,
    },
}))

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<any>('react-router-dom')
    return {
        ...actual,
        useParams: () => ({ token: mocks.token }),
        useNavigate: () => mocks.navigate,
        Link: ({ to, children }: { to: string; children: any }) => <a href={to}>{children}</a>,
    }
})

import AcceptInvitation from './AcceptInvitation'

const invitation = {
    id: 'inv1',
    email: 'invitee@example.com',
    projectName: 'DocPulse',
    inviterName: 'Admin User',
    expiresAt: '2026-12-01T00:00:00.000Z',
}

describe('AcceptInvitation unit logic', () => {
    beforeEach(() => {
        vi.useRealTimers()
        mocks.navigate.mockReset()
        mocks.getDetails.mockReset()
        mocks.accept.mockReset()
        mocks.decline.mockReset()
        mocks.token = 'invite-token'
        mocks.authState.isAuthenticated = false
        mocks.authState.user = null
    })

    it('loads invitation and shows login/signup prompt for unauthenticated users', async () => {
        mocks.getDetails.mockResolvedValueOnce({ data: invitation })
        render(<AcceptInvitation />)

        expect(await screen.findByText('Project Invitation')).not.toBeNull()
        expect(screen.getByRole('link', { name: 'Log In' }).getAttribute('href')).toBe('/login?redirect=/invite/invite-token')
        expect(screen.getByRole('link', { name: 'Sign Up' }).getAttribute('href')).toBe('/signup?redirect=/invite/invite-token')
    })

    it('accepts invitation and navigates to project', async () => {
        mocks.authState.isAuthenticated = true
        mocks.authState.user = { email: 'invitee@example.com' }
        mocks.getDetails.mockResolvedValueOnce({ data: invitation })
        mocks.accept.mockResolvedValueOnce({ data: { project: { id: 'proj-1' } } })

        render(<AcceptInvitation />)

        const acceptButton = await screen.findByRole('button', { name: 'Accept Invitation' })
        fireEvent.click(acceptButton)

        await waitFor(() => {
            expect(mocks.accept).toHaveBeenCalledWith('invite-token')
            expect(screen.getByText('Invitation Accepted!')).not.toBeNull()
        })

        await new Promise((resolve) => setTimeout(resolve, 2100))
        expect(mocks.navigate).toHaveBeenCalledWith('/projects/proj-1')
    }, 10000)

    it('shows mismatch warning when logged in with different email', async () => {
        mocks.authState.isAuthenticated = true
        mocks.authState.user = { email: 'other@example.com' }
        mocks.getDetails.mockResolvedValueOnce({ data: invitation })

        render(<AcceptInvitation />)

        expect(await screen.findByText(/This invitation was sent to/)).not.toBeNull()
        expect(screen.queryByRole('button', { name: 'Accept Invitation' })).toBeNull()
    })
})
