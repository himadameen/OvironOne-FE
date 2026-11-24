import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrandLogo } from '@/components/BrandLogo'
import { useAuthStore } from '@/stores/auth-store'

export function SplashPage() {
  const navigate = useNavigate()
  const partnerBrand = useAuthStore((s) => s.partnerBrand)
  const role = useAuthStore((s) => s.role)
  const step = useAuthStore((s) => s.step)
  const completeSplash = useAuthStore((s) => s.completeSplash)

  useEffect(() => {
    if (step === 'authenticated') {
      navigate(role === 'super_admin' ? '/super' : '/admin', { replace: true })
      return
    }
    if (step !== 'splash') {
      navigate('/auth/login', { replace: true })
      return
    }
    const t = setTimeout(() => {
      completeSplash()
      navigate(role === 'super_admin' ? '/super' : '/admin', { replace: true })
    }, 2800)
    return () => clearTimeout(t)
  }, [completeSplash, navigate, role, step])

  return (
    <div className="auth-hero-gradient fixed inset-0 flex flex-col items-center justify-center px-6 text-center">
      <div className="shell-accent-bar absolute inset-x-0 top-0" />
      <div className="animate-splash-fade space-y-6">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-card border border-brand-accent/30 bg-brand-primary animate-pulse-soft">
          <span className="font-display text-2xl font-semibold text-brand-accent">O1</span>
        </div>
        <BrandLogo partner={partnerBrand} onDark size="lg" />
        <p className="animate-splash-slide mx-auto max-w-sm text-body leading-relaxed text-on-shell opacity-0">
          Classy, calm, and precise — your hardware & construction workspace.
        </p>
      </div>
      <p className="absolute bottom-8 text-small text-on-shell">Loading workspace…</p>
    </div>
  )
}