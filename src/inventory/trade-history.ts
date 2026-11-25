import { warehouseIdsForBranchFilter } from '@/inventory/branch-warehouses'
import type { ProductVariant, StockMovement } from '@/inventory/types'
import type { PurchasePeriod } from '@/inventory/stock-metrics'

export interface MonthTradeRow {
  month: number
  label: string
  purchaseTotal: number
  saleTotal: number
}

export interface BrandTradeRow {
  brand: string
  total: number
}

function movementInScope(
  m: StockMovement,
  shopId: string,
  warehouseIds: string[] | null
): boolean {
  return m.shopId === shopId && (warehouseIds ? warehouseIds.includes(m.warehouseId) : true)
}

function purchaseAmount(m: StockMovement): number {
  return Math.abs(m.qtyDeltaBase) * (m.costRatePerBase ?? 0)
}

function saleAmount(m: StockMovement, variants: Map<string, ProductVariant>): number {
  const variant = variants.get(m.variantId)
  const rate = variant?.sellingCostPerBase ?? m.costRatePerBase ?? 0
  return Math.abs(m.qtyDeltaBase) * rate
}

function inCalendarPeriod(iso: string, period: PurchasePeriod, ref: Date): boolean {
  const d = new Date(iso)
  if (period === 'year') return d.getFullYear() === ref.getFullYear()
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
}

export function tradeValueInPeriod(
  movements: StockMovement[],
  variants: ProductVariant[],
  shopId: string,
  warehouseIds: string[] | null,
  kind: 'purchase' | 'sale',
  period: PurchasePeriod,
  ref: Date
): number {
  const variantMap = new Map(variants.map((v) => [v.id, v]))
  return movements
    .filter(
      (m) =>
        movementInScope(m, shopId, warehouseIds) &&
        m.type === kind &&
        inCalendarPeriod(m.at, period, ref)
    )
    .reduce(
      (sum, m) =>
        sum + (kind === 'purchase' ? purchaseAmount(m) : saleAmount(m, variantMap)),
      0
    )
}

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

export function monthlyTradeRows(
  movements: StockMovement[],
  variants: ProductVariant[],
  shopId: string,
  branchId: string | 'all',
  year: number
): MonthTradeRow[] {
  const warehouseIds = warehouseIdsForBranchFilter(shopId, branchId)
  const variantMap = new Map(variants.map((v) => [v.id, v]))
  const rows: MonthTradeRow[] = []

  for (let month = 0; month < 12; month += 1) {
    let purchaseTotal = 0
    let saleTotal = 0
    for (const m of movements) {
      if (!movementInScope(m, shopId, warehouseIds)) continue
      const d = new Date(m.at)
      if (d.getFullYear() !== year || d.getMonth() !== month) continue
      if (m.type === 'purchase') purchaseTotal += purchaseAmount(m)
      if (m.type === 'sale') saleTotal += saleAmount(m, variantMap)
    }
    rows.push({
      month,
      label: `${MONTH_LABELS[month]} ${year}`,
      purchaseTotal,
      saleTotal,
    })
  }
  return rows
}

export function brandLeaders(
  movements: StockMovement[],
  variants: ProductVariant[],
  shopId: string,
  branchId: string | 'all',
  kind: 'purchase' | 'sale',
  period: PurchasePeriod,
  ref: Date
): BrandTradeRow[] {
  const warehouseIds = warehouseIdsForBranchFilter(shopId, branchId)
  const variantMap = new Map(variants.map((v) => [v.id, v]))
  const byBrand = new Map<string, number>()

  for (const m of movements) {
    if (!movementInScope(m, shopId, warehouseIds) || m.type !== kind) continue
    if (!inCalendarPeriod(m.at, period, ref)) continue
    const variant = variantMap.get(m.variantId)
    const brand = variant?.brand ?? 'Unknown'
    const amount =
      kind === 'purchase' ? purchaseAmount(m) : saleAmount(m, variantMap)
    byBrand.set(brand, (byBrand.get(brand) ?? 0) + amount)
  }

  return [...byBrand.entries()]
    .map(([brand, total]) => ({ brand, total }))
    .sort((a, b) => b.total - a.total)
}

export function availableTradeYears(movements: StockMovement[], shopId: string): number[] {
  const years = new Set<number>()
  const y = new Date().getFullYear()
  years.add(y)
  for (const m of movements) {
    if (m.shopId !== shopId) continue
    years.add(new Date(m.at).getFullYear())
  }
  return [...years].sort((a, b) => b - a)
}