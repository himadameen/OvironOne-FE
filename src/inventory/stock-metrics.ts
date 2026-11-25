import { daysUntilExpiry } from '@/inventory/expiry'
import { fifoValueFromBatches, totalQtyBase } from '@/inventory/fifo'
import { warehouseIdsForBranchFilter } from '@/inventory/branch-warehouses'
import { tradeValueInPeriod } from '@/inventory/trade-history'
import type { ProductVariant, StockBatch, StockMovement } from '@/inventory/types'

export type PurchasePeriod = 'month' | 'year'

function inPeriod(iso: string, period: PurchasePeriod, ref = new Date()): boolean {
  const d = new Date(iso)
  if (period === 'year') return d.getFullYear() === ref.getFullYear()
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth()
}

function previousPeriodRef(period: PurchasePeriod, ref = new Date()): Date {
  const copy = new Date(ref)
  if (period === 'year') copy.setFullYear(copy.getFullYear() - 1)
  else copy.setMonth(copy.getMonth() - 1)
  return copy
}

function purchaseValueInPeriod(
  movements: StockMovement[],
  shopId: string,
  period: PurchasePeriod,
  warehouseIds: string[] | null,
  ref: Date
): number {
  return movements
    .filter(
      (m) =>
        m.shopId === shopId &&
        m.type === 'purchase' &&
        inPeriod(m.at, period, ref) &&
        (warehouseIds ? warehouseIds.includes(m.warehouseId) : true)
    )
    .reduce((sum, m) => sum + Math.abs(m.qtyDeltaBase) * (m.costRatePerBase ?? 0), 0)
}

export function filterBatchesByBranch(
  batches: StockBatch[],
  warehouseIds: string[] | null
): StockBatch[] {
  if (!warehouseIds) return batches
  return batches.filter((b) => warehouseIds.includes(b.warehouseId))
}

export interface ExpiryLineItem {
  variant: ProductVariant
  batch: StockBatch
  daysLeft: number
}

export function expiryLineItems(
  shopId: string,
  variants: ProductVariant[],
  batches: StockBatch[],
  warehouseIds: string[] | null,
  withinDays = 30
): ExpiryLineItem[] {
  const variantMap = new Map(variants.filter((v) => v.shopId === shopId).map((v) => [v.id, v]))
  const list: ExpiryLineItem[] = []
  for (const batch of filterBatchesByBranch(batches, warehouseIds)) {
    if (batch.qtyBase <= 0) continue
    const variant = variantMap.get(batch.variantId)
    if (!variant) continue
    const days = daysUntilExpiry(batch.expiryDate)
    if (days <= withinDays) {
      list.push({ variant, batch, daysLeft: days })
    }
  }
  return list.sort((a, b) => a.daysLeft - b.daysLeft)
}

export function computeStockDashboard(
  shopId: string,
  variants: ProductVariant[],
  batches: StockBatch[],
  movements: StockMovement[],
  branchId: string | 'all',
  purchasePeriod: PurchasePeriod
) {
  const warehouseIds = warehouseIdsForBranchFilter(shopId, branchId)
  const shopVariants = variants.filter((v) => v.shopId === shopId)
  const scopedVariants =
    warehouseIds === null
      ? shopVariants
      : shopVariants.filter((v) => warehouseIds.includes(v.warehouseId))

  let remainingValue = 0
  let inStockSkus = 0
  for (const variant of scopedVariants) {
    const variantBatches = filterBatchesByBranch(
      batches.filter((b) => b.variantId === variant.id),
      warehouseIds
    )
    const qty = totalQtyBase(variantBatches)
    if (qty > 0) inStockSkus += 1
    remainingValue += fifoValueFromBatches(variantBatches)
  }

  const now = new Date()
  const currentPurchase = purchaseValueInPeriod(movements, shopId, purchasePeriod, warehouseIds, now)
  const prevPurchase = purchaseValueInPeriod(
    movements,
    shopId,
    purchasePeriod,
    warehouseIds,
    previousPeriodRef(purchasePeriod, now)
  )

  const currentSale = tradeValueInPeriod(
    movements,
    variants,
    shopId,
    warehouseIds,
    'sale',
    purchasePeriod,
    now
  )
  const prevSale = tradeValueInPeriod(
    movements,
    variants,
    shopId,
    warehouseIds,
    'sale',
    purchasePeriod,
    previousPeriodRef(purchasePeriod, now)
  )

  const expiryItems = expiryLineItems(shopId, variants, batches, warehouseIds)

  return {
    totalSkus: scopedVariants.length,
    inStockSkus,
    remainingValue,
    expiryCount: expiryItems.length,
    expiryItems,
    purchaseTotal: currentPurchase,
    purchaseTrend: currentPurchase >= prevPurchase ? ('up' as const) : ('down' as const),
    purchaseDelta: Math.abs(currentPurchase - prevPurchase),
    saleTotal: currentSale,
    saleTrend: currentSale >= prevSale ? ('up' as const) : ('down' as const),
    saleDelta: Math.abs(currentSale - prevSale),
  }
}