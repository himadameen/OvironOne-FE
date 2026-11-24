import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserRole } from '@/types'

type AuthStep = 'login' | 'reset_otp' | 'splash' | 'authenticated'

interface AuthState {
  email: string
  resetToken: 'verified' | null
  role: UserRole | null
  shopId: string | null
  partnerBrand: string
  step: AuthStep
  login: (email: string, role: UserRole, shopId?: string) => void
  requestReset: (email: string) => void
  verifyResetOtp: (code: string) => boolean
  completeSplash: () => void
  completeReset: () => void
  logout: () => void
}

export const DEMO_OTP = '123456'

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      email: '',
      resetToken: null,
      role: null,
      shopId: 'shop-ambur',
      partnerBrand: 'BuildCore Supplies',
      step: 'login',
      login: (email, role, shopId) =>
        set({
          email,
          role,
          shopId: shopId ?? (role === 'shop_admin' ? 'shop-ambur' : null),
          resetToken: null,
          step: 'splash',
        }),
      requestReset: (email) =>
        set({
          email,
          resetToken: null,
          step: 'reset_otp',
          role: null,
        }),
      verifyResetOtp: (code) => {
        if (code.trim() !== DEMO_OTP) return false
        set({ resetToken: 'verified', step: 'login' })
        return true
      },
      completeSplash: () => set({ step: 'authenticated' }),
      completeReset: () => set({ resetToken: null, step: 'login' }),
      logout: () =>
        set({
          role: null,
          shopId: null,
          step: 'login',
          resetToken: null,
        }),
    }),
    {
      name: 'oviron-auth',
      partialize: (s) => ({
        email: s.email,
        role: s.role,
        shopId: s.shopId,
        partnerBrand: s.partnerBrand,
        step: s.step,
        resetToken: s.resetToken,
      }),
    }
  )
)