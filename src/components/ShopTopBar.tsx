import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, Circle, LogOut, Menu, Monitor, MonitorOff } from 'lucide-react'
import { branchesForShop } from '@/data/mock-branches'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useShopWorkspaceStore } from '@/stores/shop-workspace-store'
import type { Shop } from '@/types'

interface ShopTopBarProps {
  shop: Shop
  onOpenMobileNav?: () => void
}

export function ShopTopBar({ shop, onOpenMobileNav }: ShopTopBarProps) {
  const navigate = useNavigate()
  const logout = useAuthStore((s) => s.logout)
  const branchId = useShopWorkspaceStore((s) => s.branchId)
  const setBranchId = useShopWorkspaceStore((s) => s.setBranchId)
  const posOpen = useShopWorkspaceStore((s) => s.posOpen)
  const openPos = useShopWorkspaceStore((s) => s.openPos)
  const closePos = useShopWorkspaceStore((s) => s.closePos)

  const location = useLocation()
  const branches = branchesForShop(shop.id)
  const showBranchPicker = branches.length > 1

  useEffect(() => {
    if (location.pathname === '/admin/pos' || location.pathname.startsWith('/admin/pos/')) {
      openPos()
    }
  }, [location.pathname, openPos])

  const handlePos = () => {
    if (posOpen) {
      closePos()
      navigate('/admin')
    } else {
      openPos()
      navigate('/admin/pos')
    }
  }

  return (
    <header className="shop-topbar">
      <div className="shop-topbar-start">
        <button
          type="button"
          className="btn-ghost-light lg:hidden"
          onClick={onOpenMobileNav}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <p className="shop-topbar-eyebrow">{shop.name}</p>
          <p className="shop-topbar-title capitalize">{shop.vertical} admin</p>
        </div>
      </div>

      <div className="shop-topbar-end">
        {showBranchPicker ? (
          <label className="shop-branch-select inline-flex">
            <span className="sr-only">Branch</span>
            <select
              className="shop-branch-select-input"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value as 'all' | string)}
            >
              <option value="all">All branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <ChevronDown className="shop-branch-select-chevron" aria-hidden />
          </label>
        ) : null}

        <button
          type="button"
          className={cn('shop-pos-toggle', posOpen && 'shop-pos-toggle--active')}
          onClick={handlePos}
        >
          <span className="shop-pos-toggle-icon" aria-hidden>
            {posOpen ? <MonitorOff className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
          </span>
          <span className="shop-pos-toggle-text">
            {posOpen ? 'Close POS' : 'Open POS'}
          </span>
          {posOpen ? (
            <Circle className="shop-pos-live-dot h-2 w-2 fill-current" aria-hidden />
          ) : null}
        </button>

        <button
          type="button"
          className="btn-ghost-light shrink-0"
          onClick={() => {
            logout()
            navigate('/auth/login')
          }}
          aria-label="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}