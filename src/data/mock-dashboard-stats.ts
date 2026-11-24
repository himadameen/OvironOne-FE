import type { DashboardSnapshot } from '@/types'

const ambur: Record<string, DashboardSnapshot> = {
  all: {
    billsToday: 24,
    billsHint: '+3 vs yesterday',
    skuInStock: 1842,
    lowStock: 6,
    rentalsOut: 17,
    staffOnDuty: 6,
  },
  'branch-ambur-main': {
    billsToday: 16,
    billsHint: '+2 vs yesterday',
    skuInStock: 1120,
    lowStock: 3,
    rentalsOut: 11,
    staffOnDuty: 4,
  },
  'branch-ambur-yard': {
    billsToday: 8,
    billsHint: '+1 vs yesterday',
    skuInStock: 722,
    lowStock: 3,
    rentalsOut: 6,
    staffOnDuty: 2,
  },
}

const hardware: Record<string, DashboardSnapshot> = {
  all: {
    billsToday: 11,
    billsHint: 'Steady',
    skuInStock: 940,
    lowStock: 4,
    rentalsOut: 0,
    staffOnDuty: 3,
  },
  'branch-hardware-main': {
    billsToday: 11,
    billsHint: 'Steady',
    skuInStock: 940,
    lowStock: 4,
    rentalsOut: 0,
    staffOnDuty: 3,
  },
}

const defaultStats: DashboardSnapshot = {
  billsToday: 5,
  billsHint: '—',
  skuInStock: 120,
  lowStock: 1,
  rentalsOut: 2,
  staffOnDuty: 2,
}

const byShop: Record<string, Record<string, DashboardSnapshot>> = {
  'shop-ambur': ambur,
  'shop-hardware': hardware,
}

export function dashboardSnapshot(
  shopId: string,
  branchKey: string
): DashboardSnapshot {
  const table = byShop[shopId]
  if (!table) return defaultStats
  return table[branchKey] ?? table.all ?? defaultStats
}