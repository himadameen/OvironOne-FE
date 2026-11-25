import type { ProductVariant } from '@/inventory/types'

/** Default max discount off list selling price when variant has no explicit cap. */
export const DEFAULT_MAX_DISCOUNT_PERCENT = 12

export function maxDiscountPercentFor(variant: ProductVariant): number {
  return variant.maxDiscountPercent ?? DEFAULT_MAX_DISCOUNT_PERCENT
}

/** Lowest allowed unit sell rate (list price minus max discount). */
export function sellingPriceAfterMaxDiscount(
  sellingCostPerBase: number,
  maxDiscountPercent: number
): number {
  const pct = Math.min(100, Math.max(0, maxDiscountPercent))
  return sellingCostPerBase * (1 - pct / 100)
}