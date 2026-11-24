import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, Menu, Store, Users, X } from 'lucide-react'
import { CustomerSupportEntry } from '@/components/CustomerSupportEntry'
import { BrandLogo } from '@/components/BrandLogo'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

const links = [
  { to: '/super', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/super/shops', icon: Store, label: 'Shops & packages' },
  { to: '/super/users', icon: Users, label: 'Users' },
]

export function SuperAdminLayout() {
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const logout = useAuthStore((s) => s.logout)

  const Nav = ({ onNav }: { onNav?: () => void }) => (
    <nav className="shell-light space-y-1 p-4">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          onClick={onNav}
          className={({ isActive }) =>
            cn('sidebar-link text-sm', isActive && 'sidebar-link-active')
          }
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-surface">
      <aside className="shell-light fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-silver lg:flex lg:flex-col">
        <div className="shell-accent-bar" />
        <div className="border-b border-silver p-4">
          <BrandLogo />
          <p className="mt-2 text-xs font-medium text-muted">Super admin</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Nav />
        </div>
        <div className="sidebar-footer shrink-0">
          <CustomerSupportEntry />
        </div>
      </aside>

      {drawerOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-charcoal/20 lg:hidden"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close menu"
        />
      ) : null}
      <aside
        className={cn(
          'shell-light fixed inset-y-0 left-0 z-50 flex w-72 flex-col transition-transform lg:hidden',
          drawerOpen ? 'translate-x-0' : '-translate-x-full',
          'border-r border-silver'
        )}
      >
        <div className="flex items-center justify-between border-b border-silver p-4">
          <BrandLogo size="sm" />
          <button type="button" className="btn-ghost-light" onClick={() => setDrawerOpen(false)} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Nav onNav={() => setDrawerOpen(false)} />
        </div>
        <div className="sidebar-footer mx-3 mb-4 shrink-0">
          <CustomerSupportEntry />
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-64">
        <header className="shell-light flex h-[3.25rem] shrink-0 items-center gap-2 border-b border-silver px-4 shadow-card">
          <button type="button" className="btn-ghost-light lg:hidden" onClick={() => setDrawerOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-base font-medium tracking-wide text-charcoal md:text-lg">
            Platform control
          </h1>
          <div className="flex-1" />
          <button
            type="button"
            className="btn-ghost-light"
            onClick={() => {
              logout()
              navigate('/auth/login')
            }}
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </header>
        <main className="flex-1 bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  )
}