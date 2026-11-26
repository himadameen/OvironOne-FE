import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { InventorySubnav } from '@/components/inventory/InventorySubnav'

export function InventoryModuleLayout() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="app-main-scroll flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  )
}

export function InventoryPageHeader({ children }: { children?: ReactNode }) {
  return (
    <div className="mb-4 space-y-4">
      <InventorySubnav />
      {children}
    </div>
  )
}