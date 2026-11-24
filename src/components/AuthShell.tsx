import type { ReactNode } from 'react'
import { BrandLogo } from '@/components/BrandLogo'
import { openCustomerSupport } from '@/stores/customer-support-store'

interface AuthShellProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <aside className="auth-hero-gradient relative hidden flex-col justify-between p-10 lg:flex">
        <div className="shell-accent-bar absolute inset-x-0 top-0" />
        <div className="space-y-6 pt-5">
          <BrandLogo onDark size="lg" />
          <div className="max-w-md space-y-3">
            <h1 className="font-display text-h1 text-[#F4F1EC]">Hardware shop admin</h1>
            <p className="text-body leading-relaxed text-on-shell">
              Paint, fasteners, tools, and rental equipment — refined control for
              your shop floor and back office.
            </p>
          </div>
        </div>
        <p className="text-small text-on-shell/80">Demo · no live backend</p>
      </aside>

      <main className="flex min-h-screen items-center justify-center bg-surface p-6">
        <div className="w-full max-w-md space-y-6">
          <BrandLogo size="md" className="lg:hidden" />
          <div className="space-y-2">
            <h2 className="text-h1">{title}</h2>
            {subtitle ? <p className="text-body text-muted">{subtitle}</p> : null}
          </div>
          {children}
          <p className="text-center text-sm text-muted">
            Need help?{' '}
            <button
              type="button"
              className="font-medium text-brand-primary underline-offset-2 hover:underline"
              onClick={openCustomerSupport}
            >
              Contact customer support
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}