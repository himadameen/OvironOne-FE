import { useEffect, useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { ChevronDown, X } from 'lucide-react'
import { ShopTopBar } from '@/components/ShopTopBar'
import { SidebarBrandMark } from '@/components/SidebarBrandMark'
import { SidebarCollapseToggle } from '@/components/SidebarCollapseToggle'
import { CustomerSupportEntry } from '@/components/CustomerSupportEntry'
import { SidebarProfile } from '@/components/SidebarProfile'
import { cn } from '@/lib/utils'
import { mockShops } from '@/data/mock-shops'
import { shopMenuIcons } from '@/data/shop-menu-icons'
import { groupMenus, menusForPackage } from '@/data/shop-menus'
import { useAuthStore } from '@/stores/auth-store'

const DEFAULT_COLLAPSED = new Set(['Operations', 'Construction', 'Insights', 'People'])
const SIDEBAR_STORAGE_KEY = 'oviron-shop-sidebar-collapsed'

export function ShopAdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(DEFAULT_COLLAPSED)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1'
    } catch {
      return false
    }
  })
  const shopId = useAuthStore((s) => s.shopId)
  const partnerBrand = useAuthStore((s) => s.partnerBrand)
  const email = useAuthStore((s) => s.email)

  const shop = mockShops.find((s) => s.id === shopId) ?? mockShops[0]
  const items = menusForPackage(shop.package, shop.menusEnabled)
  const groups = groupMenus(items)

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, sidebarCollapsed ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [sidebarCollapsed])

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(group)) next.delete(group)
      else next.add(group)
      return next
    })
  }

  const SidebarBrand = ({ compact }: { compact?: boolean }) => (
    <div className={compact ? 'sidebar-brand-block--collapsed' : 'sidebar-brand-block'}>
      <SidebarBrandMark partnerName={partnerBrand} compact={compact} />
    </div>
  )

  const SidebarNav = ({ onNav, iconOnly }: { onNav?: () => void; iconOnly?: boolean }) => {
    if (iconOnly) {
      return (
        <nav className="flex flex-col items-center gap-1 px-2 py-3" aria-label="Main">
          {items.map((item) => {
            const Icon = shopMenuIcons[item.id]
            if (!Icon) return null
            return (
              <NavLink
                key={item.id}
                to={item.path}
                end={item.path === '/admin'}
                title={item.label}
                onClick={onNav}
                className={({ isActive }) =>
                  cn(
                    'sidebar-link sidebar-link--icon',
                    isActive && 'sidebar-link-active'
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                <span className="sr-only">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      )
    }

    return (
      <nav className="sidebar-nav-block" aria-label="Main">
        {groups.map(([group, links]) => {
          const expanded = !collapsedGroups.has(group)
          return (
            <div key={group} className="mb-2">
              <button
                type="button"
                className="sidebar-group-trigger"
                onClick={() => toggleGroup(group)}
                aria-expanded={expanded}
              >
                {group}
                <ChevronDown
                  className={cn(
                    'h-3.5 w-3.5 shrink-0 opacity-60 transition-transform duration-300 ease-out',
                    !expanded && '-rotate-90'
                  )}
                  aria-hidden
                />
              </button>
              <div
                className={cn(
                  'sidebar-group-panel',
                  expanded && 'sidebar-group-panel--open'
                )}
              >
                <div className="sidebar-group-panel-inner">
                  <ul className="space-y-0.5 pl-0.5 pb-1 pt-0.5">
                    {links.map((item) => {
                      const Icon = shopMenuIcons[item.id]
                      return (
                        <li key={item.id}>
                          <NavLink
                            to={item.path}
                            end={item.path === '/admin'}
                            onClick={onNav}
                            className={({ isActive }) =>
                              cn('sidebar-link', isActive && 'sidebar-link-active')
                            }
                          >
                            {Icon ? (
                              <Icon className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
                            ) : null}
                            <span>{item.label}</span>
                          </NavLink>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )
        })}
      </nav>
    )
  }

  const desktopAside = (
    <aside
      className={cn(
        'sidebar-shell fixed inset-y-0 left-0 z-30 flex flex-col',
        sidebarCollapsed ? 'sidebar-shell-collapsed' : 'sidebar-shell-expanded'
      )}
    >
      <div className="shell-accent-bar" />
      <SidebarBrand compact={sidebarCollapsed} />
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
        <SidebarNav iconOnly={sidebarCollapsed} />
      </div>
      <div className="sidebar-footer">
        <CustomerSupportEntry compact={sidebarCollapsed} />
        <SidebarProfile email={email} compact={sidebarCollapsed} />
      </div>
      <SidebarCollapseToggle
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        className="absolute -right-4 top-1/2 z-40 -translate-y-1/2"
      />
    </aside>
  )

  return (
    <div className="min-h-screen bg-surface">
      {desktopAside}

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
          'shell-light fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-silver transition-transform lg:hidden',
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-end border-b border-silver px-3">
          <button type="button" className="btn-ghost-light" onClick={() => setDrawerOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <SidebarBrand />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <SidebarNav onNav={() => setDrawerOpen(false)} />
        </div>
        <div className="sidebar-footer mx-3 mb-4">
          <CustomerSupportEntry />
          <SidebarProfile email={email} />
        </div>
      </aside>

      <div
        className={cn(
          'flex h-screen min-h-0 min-w-0 flex-col overflow-hidden transition-[padding] duration-300 ease-out',
          sidebarCollapsed ? 'lg:pl-[4.75rem]' : 'lg:pl-[17rem]'
        )}
      >
        <ShopTopBar shop={shop} onOpenMobileNav={() => setDrawerOpen(true)} />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-surface">
          <Outlet />
        </main>
      </div>
    </div>
  )
}