import type { StockMovement } from '@/inventory/types'

/**
 * Lifetime purchased / received qty in base units for a variant at the branch scope.
 * Uses purchase + opening movements when present; otherwise remaining + historical outbound.
 */
export function totalPurchasedQtyBase(
  shopId: string,
  variantId: string,
  warehouseIds: string[] | null,
  movements: StockMovement[],
  remainingBase: number
): number {
  const scoped = movements.filter(
    (m) =>
      m.shopId === shopId &&
      m.variantId === variantId &&
      (warehouseIds ? warehouseIds.includes(m.warehouseId) : true)
  )

  const fromMovements = scoped
    .filter((m) => (m.type === 'purchase' || m.type === 'opening') && m.qtyDeltaBase > 0)
    .reduce((sum, m) => sum + m.qtyDeltaBase, 0)

  if (fromMovements > 0) return fromMovements

  const consumed = scoped
    .filter((m) => m.qtyDeltaBase < 0)
    .reduce((sum, m) => sum + Math.abs(m.qtyDeltaBase), 0)

  return remainingBase + consumed
}