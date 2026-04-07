import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    dispatch: vi.fn(async () => undefined),
    navigate: vi.fn(),
    authState: {
        isLoading: false,
        error: null as string | null,
        otpEmail: 'dev@example.com' as string | null,
        isAuthenticated: false,
    },
    verifyOtp: vi.fn((payload: any) => ({ type: 'auth/verify_otp', payload })),
    resendOtp: vi.fn((email: string) => ({ type: 'auth/resend_otp', payload: email })),
    clearError: vi.fn(() => ({ type: 'auth/clearError' })),
    clearOtpState: vi.fn(() => ({ type: 'auth/clearOtpState' })),
}))

vi.mock('../store/hooks', () => ({
    useAppDispatch: () => mocks.dispatch,
    useAppSelector: (selector: any) => selector({ auth: mocks.authState }),
}))

vi.mock('../store/slices/authSlice', () => ({
    verifyOtp: mocks.verifyOtp,
    resendOtp: mocks.resendOtp,
    clearError: mocks.clearError,
    clearOtpState: mocks.clearOtpState,
}))

vi.mock('react-router-dom', () => ({
    useNavigate: () => mocks.navigate,
}))

import VerifyOTP from './VerifyOTP'

describe('VerifyOTP unit logic', () => {
    beforeEach(() => {
        vi.useRealTimers()
        mocks.dispatch.mockReset()
        mocks.navigate.mockReset()
        mocks.verifyOtp.mockClear()
        mocks.resendOtp.mockClear()
        mocks.clearError.mockClear()
        mocks.clearOtpState.mockClear()
        mocks.authState.isLoading = false
        mocks.authState.error = null
        mocks.authState.otpEmail = 'dev@example.com'
        mocks.authState.isAuthenticated = false
    })

    it('redirects to signup when otpEmail is missing', async () => {
        mocks.authState.otpEmail = null
        render(<VerifyOTP />)

        await waitFor(() => {
            expect(mocks.navigate).toHaveBeenCalledWith('/signup')
        })
    })

    it('redirects to dashboard when already authenticated', async () => {
        mocks.authState.isAuthenticated = true
        render(<VerifyOTP />)

        await waitFor(() => {
            expect(mocks.navigate).toHaveBeenCalledWith('/dashboard')
        })
    })

    it('dispatches verifyOtp when 6 digits are submitted', async () => {
        render(<VerifyOTP />)

        const inputs = document.querySelectorAll('.otp-input')
            ;['1', '2', '3', '4', '5', '6'].forEach((value, idx) => {
                fireEvent.change(inputs[idx], { target: { value } })
            })

        await waitFor(() => {
            expect(mocks.verifyOtp).toHaveBeenCalledWith({ email: 'dev@example.com', otp: '123456' })
        })
    })

    it('shows resend cooldown message before OTP can be resent', async () => {
        render(<VerifyOTP />)

        expect(screen.getByText(/Resend OTP in/)).not.toBeNull()
        expect(mocks.resendOtp).not.toHaveBeenCalled()
    })

    it('back button clears otp state and navigates to signup', async () => {
        render(<VerifyOTP />)

        fireEvent.click(screen.getByRole('button', { name: /Back to Sign Up/i }))

        await waitFor(() => {
            expect(mocks.clearOtpState).toHaveBeenCalledTimes(1)
            expect(mocks.navigate).toHaveBeenCalledWith('/signup')
        })
    })
})
