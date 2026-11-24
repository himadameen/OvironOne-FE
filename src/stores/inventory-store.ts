import { create } from 'zustand'
import { daysUntilExpiry } from '@/inventory/expiry'
import { fifoValueFromBatches, totalQtyBase, weightedAvgCost } from '@/inventory/fifo'
import { formatInr, marginPercent } from '@/inventory/format-money'
import { cloneInventorySeed } from '@/inventory/mock-data'
import type { StockAdjustmentInput } from '@/inventory/schemas'
import { matchesQuickFilter, variantHealth } from '@/inventory/status'
import type {
  InventoryCategory,
  ProductVariant,
  StockBatch,
  StockMovement,
  StockQuickFilter,
  Warehouse,
} from '@/inventory/types'
import { convertFromBase, convertToBase, formatQty } from '@/inventory/units'

interface InventoryState {
  categories: InventoryCategory[]
  variants: ProductVariant[]
  batches: StockBatch[]
  movements: StockMovement[]
  warehouses: Warehouse[]
  allowNegativeStockOverride: boolean
  applyAdjustment: (
    shopId: string,
    userEmail: string,
    input: StockAdjustmentInput,
    densityKgPerL?: number,
    baseKind?: import('@/inventory/types').BaseUnitKind
  ) => { ok: true } | { ok: false; message: string }
}

function movementId() {
  return `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

const seed = cloneInventorySeed()

export const useInventoryStore = create<InventoryState>((set, get) => ({
  ...seed,
  allowNegativeStockOverride: false,

  applyAdjustment: (shopId, userEmail, input, densityKgPerL, baseKind) => {
    const state = get()
    const variant = state.variants.find((v) => v.id === input.variantId && v.shopId === shopId)
    const batch = state.batches.find((b) => b.id === input.batchId)
    if (!variant || !batch || batch.variantId !== variant.id) {
      return { ok: false, message: 'Variant or batch not found.' }
    }
    const kind = baseKind ?? variant.baseKind
    const density = densityKgPerL ?? variant.densityKgPerL

    let deltaBase: number
    try {
      deltaBase = convertToBase(input.qty, input.unit, kind, density)
    } catch (err) {
      return {
        ok: false,
        message: err instanceof Error ? err.message : 'Invalid unit conversion.',
      }
    }
    const signed = input.direction === 'increase' ? deltaBase : -deltaBase
    const nextQty = batch.qtyBase + signed

    if (nextQty < 0 && !state.allowNegativeStockOverride && !input.allowNegativeOverride) {
      const onHand = convertFromBase(batch.qtyBase, input.unit, kind, density)
      return {
        ok: false,
        message: `Batch ${batch.batchNo} has ${formatQty(onHand, input.unit)}; you tried to remove ${formatQty(input.qty, input.unit)}.`,
      }
    }

    const movement: StockMovement = {
      id: movementId(),
      shopId,
      at: new Date(input.effectiveDate).toISOString(),
      type: 'adjustment',
      variantId: variant.id,
      batchId: batch.id,
      qtyDeltaBase: signed,
      costRatePerBase: batch.costRatePerBase,
      warehouseId: batch.warehouseId,
      userEmail,
      reference: `ADJ-${String(state.movements.length + 1).padStart(3, '0')}`,
      note: input.note,
      reason: input.reason,
    }

    set({
      batches: state.batches.map((b) =>
        b.id === batch.id ? { ...b, qtyBase: Math.max(0, nextQty) } : b
      ),
      movements: [movement, ...state.movements],
    })

    return { ok: true }
  },
}))

export interface VariantRowView {
  variant: ProductVariant
  batches: StockBatch[]
  qtyBase: number
  fifoValue: number
  health: ReturnType<typeof variantHealth>
  lastMovementAt?: string
}

export function getVariantRows(shopId: string, quickFilter: StockQuickFilter = 'all'): VariantRowView[] {
  const { variants, batches, movements } = useInventoryStore.getState()
  return variants
    .filter((v) => v.shopId === shopId)
    .map((variant) => {
      const variantBatches = batches.filter((b) => b.variantId === variant.id)
      const qtyBase = totalQtyBase(variantBatches)
      const fifoValue = fifoValueFromBatches(variantBatches)
      const health = variantHealth(qtyBase, variant.reorderLevelBase, variantBatches)
      const lastMov = movements
        .filter((m) => m.variantId === variant.id)
        .sort((a, b) => b.at.localeCompare(a.at))[0]
      return {
        variant,
        batches: variantBatches,
        qtyBase,
        fifoValue,
        health,
        lastMovementAt: lastMov?.at,
      }
    })
    .filter((row) =>
      matchesQuickFilter(quickFilter, row.qtyBase, row.variant.reorderLevelBase, row.batches)
    )
}

export function getOverviewKpis(shopId: string) {
  const rows = getVariantRows(shopId, 'all')
  let lowStock = 0
  let expiring30 = 0
  let expired = 0
  let oos = 0
  let stockValue = 0

  const today = new Date()
  for (const row of rows) {
    stockValue += row.fifoValue
    if (row.health.includes('oos')) oos += 1
    if (row.health.includes('low')) lowStock += 1
    if (row.health.includes('expired')) expired += 1
    else if (row.health.includes('expiring')) expiring30 += 1
    for (const b of row.batches) {
      if (b.qtyBase <= 0) continue
      const days = daysUntilExpiry(b.expiryDate, today)
      if (days < 0 && row.health.includes('expired')) break
    }
  }

  return {
    totalSkus: rows.length,
    stockValue,
    stockValueLabel: formatInr(stockValue),
    lowStock,
    expiring30,
    expired,
    oos,
  }
}

export function getVariantDetail(shopId: string, variantId: string) {
  const { variants, batches, movements } = useInventoryStore.getState()
  const variant = variants.find((v) => v.id === variantId && v.shopId === shopId)
  if (!variant) return null
  const variantBatches = batches.filter((b) => b.variantId === variantId)
  const qtyBase = totalQtyBase(variantBatches)
  const fifoValue = fifoValueFromBatches(variantBatches)
  const avgCost = weightedAvgCost(variantBatches)
  const selling = variant.sellingCostPerBase
  const purchase = variant.purchaseCostPerBase
  const margin = marginPercent(selling, purchase)
  const ledger = movements
    .filter((m) => m.variantId === variantId)
    .sort((a, b) => b.at.localeCompare(a.at))
  return {
    variant,
    batches: variantBatches,
    qtyBase,
    fifoValue,
    avgCost,
    selling,
    purchase,
    margin,
    ledger,
    health: variantHealth(qtyBase, variant.reorderLevelBase, variantBatches),
  }
}

export function listCategories(shopId: string) {
  return useInventoryStore.getState().categories.filter((c) => c.shopId === shopId)
}