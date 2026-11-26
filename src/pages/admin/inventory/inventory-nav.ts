export const INVENTORY_NAV: ReadonlyArray<{ to: string; label: string; end: boolean }> = [
  { to: '/admin/inventory', label: 'Stocks', end: true },
  { to: '/admin/inventory/brands', label: 'Brands', end: true },
  { to: '/admin/inventory/categories', label: 'Categories', end: true },
  { to: '/admin/inventory/variants', label: 'SKU list', end: true },
  { to: '/admin/inventory/batches', label: 'Batch lots', end: true },
]