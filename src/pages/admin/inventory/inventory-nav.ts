export const INVENTORY_NAV = [
  { to: '/admin/inventory', label: 'Overview', end: true },
  { to: '/admin/inventory/variants', label: 'Variants', end: false },
  { to: '/admin/inventory/batches', label: 'Batches', end: false },
  { to: '/admin/inventory/movements', label: 'Movements', end: false },
  { to: '/admin/inventory/adjustments/new', label: 'Adjustment', end: true },
] as const