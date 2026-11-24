import { formatInr } from '@/inventory/format-money'
import type { ProductVariant } from '@/inventory/types'
import { convertFromBase } from '@/inventory/units'

export function qtyOnHandDisplay(qtyBase: number, variant: ProductVariant): string {
  const qty = convertFromBase(qtyBase, variant.defaultDisplayUnit, variant.baseKind, variant.densityKgPerL)
  const rounded =
    variant.baseKind === 'count'
      ? String(Math.round(qty))
      : qty.toFixed(2).replace(/\.?0+$/, '')
  return `${rounded} ${variant.defaultDisplayUnit}`
}

export function ratePerDisplayUnit(ratePerBase: number, variant: ProductVariant): string {
  let per = ratePerBase
  if (variant.baseKind === 'volume' && variant.defaultDisplayUnit === 'L') per = ratePerBase * 1000
  if (variant.baseKind === 'mass' && variant.defaultDisplayUnit === 'kg') per = ratePerBase * 1000
  return `${formatInr(per)} / ${variant.defaultDisplayUnit}`
}