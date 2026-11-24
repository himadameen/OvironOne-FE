import { daysUntilExpiry } from '@/inventory/expiry'
import type { StockBatch, StockHealth } from '@/inventory/types'

export function variantHealth(
  qtyBase: number,
  reorderLevelBase: number,
  batches: StockBatch[]
): StockHealth[] {
  const tags: StockHealth[] = []
  if (qtyBase <= 0) {
    tags.push('oos')
    return tags
  }
  const hasExpired = batches.some(
    (b) => b.qtyBase > 0 && daysUntilExpiry(b.expiryDate) < 0
  )
  const hasExpiring = batches.some(
    (b) => b.qtyBase > 0 && daysUntilExpiry(b.expiryDate) >= 0 && daysUntilExpiry(b.expiryDate) <= 30
  )
  if (hasExpired) tags.push('expired')
  else if (hasExpiring) tags.push('expiring')
  if (qtyBase <= reorderLevelBase) tags.push('low')
  if (tags.length === 0) tags.push('ok')
  return tags
}

export function matchesQuickFilter(
  filter: import('@/inventory/types').StockQuickFilter,
  qtyBase: number,
  reorderLevelBase: number,
  batches: StockBatch[]
): boolean {
  const health = variantHealth(qtyBase, reorderLevelBase, batches)
  if (filter === 'all') return true
  if (filter === 'low') return health.includes('low')
  if (filter === 'expiring') return health.includes('expiring')
  if (filter === 'expired') return health.includes('expired')
  if (filter === 'oos') return health.includes('oos')
  return true
}