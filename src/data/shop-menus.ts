import type { MenuItem, PackageTier } from '@/types'

const tierRank: Record<PackageTier, number> = {
  starter: 1,
  growth: 2,
  enterprise: 3,
}

export const shopMenuCatalog: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/admin', package: 'starter', group: 'Overview' },
  { id: 'inventory', label: 'Inventory', path: '/admin/inventory', package: 'starter', group: 'Operations' },
  { id: 'pos', label: 'Billing & POS', path: '/admin/pos', package: 'starter', group: 'Operations' },
  { id: 'suppliers', label: 'Suppliers', path: '/admin/suppliers', package: 'growth', group: 'Operations' },
  { id: 'rentals', label: 'Equipment rental', path: '/admin/rentals', package: 'growth', group: 'Construction' },
  { id: 'projects', label: 'Site projects', path: '/admin/projects', package: 'enterprise', group: 'Construction' },
  { id: 'reports', label: 'Reports', path: '/admin/reports', package: 'growth', group: 'Insights' },
  { id: 'staff', label: 'Staff', path: '/admin/staff', package: 'enterprise', group: 'People' },
]

export function menusForPackage(
  pkg: PackageTier,
  enabledIds?: string[]
): MenuItem[] {
  const rank = tierRank[pkg]
  return shopMenuCatalog.filter((item) => {
    if (tierRank[item.package] > rank) return false
    if (enabledIds && !enabledIds.includes(item.id)) return false
    return true
  })
}

export function groupMenus(items: MenuItem[]) {
  const map = new Map<string, MenuItem[]>()
  for (const item of items) {
    const list = map.get(item.group) ?? []
    list.push(item)
    map.set(item.group, list)
  }
  return [...map.entries()]
}