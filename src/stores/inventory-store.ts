import { create } from 'zustand'
import { daysUntilExpiry } from '@/inventory/expiry'
import { fifoValueFromBatches, totalQtyBase, weightedAvgCost } from '@/inventory/fifo'
import { formatInr, marginPercent } from '@/inventory/format-money'
import { DEFAULT_MAX_DISCOUNT_PERCENT } from '@/inventory/pricing'
import { cloneInventorySeed } from '@/inventory/mock-data'
import type { StockAdjustmentInput } from '@/inventory/schemas'
import { matchesQuickFilter, variantHealth } from '@/inventory/status'
import type {
  BrandFormInput,
  InventoryBrand,
  InventoryCategory,
  InventoryCategoryKind,
  ProductVariant,
  StockBatch,
  StockMovement,
  StockQuickFilter,
  Warehouse,
} from '@/inventory/types'
import { warehouseForBranch } from '@/inventory/branch-warehouses'
import type { StockFormValues } from '@/inventory/stock-form-schema'
import { convertFromBase, convertToBase, formatQty } from '@/inventory/units'

interface InventoryState {
  brands: InventoryBrand[]
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
  saveStockEntry: (
    shopId: string,
    userEmail: string,
    values: StockFormValues,
    editVariantId?: string
  ) => { ok: true; variantId: string } | { ok: false; message: string }
  deleteStockEntry: (shopId: string, variantId: string) => void
  upsertBrand: (shopId: string, input: BrandFormInput) => string
  upsertCategory: (
    shopId: string,
    input: {
      id?: string
      name: string
      description?: string
      kind: InventoryCategoryKind
      active: boolean
      defaultDisplayUnit: ProductVariant['defaultDisplayUnit']
    }
  ) => string
  receiveStockOnVariant: (
    shopId: string,
    userEmail: string,
    variantId: string,
    values: Pick<
      StockFormValues,
      'branchId' | 'purchaseCost' | 'sellingCost' | 'qty' | 'defaultDisplayUnit' | 'expiryDate'
    >
  ) => { ok: true } | { ok: false; message: string }
}

function movementId() {
  return `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`
}

const seed = cloneInventorySeed()

function withBrandIds(variants: ProductVariant[], brands: InventoryBrand[]): ProductVariant[] {
  return variants.map((v) => ({
    ...v,
    brandId: v.brandId ?? brands.find((b) => b.shopId === v.shopId && b.name === v.brand)?.id,
  }))
}

const initialVariants = withBrandIds(seed.variants, seed.brands)

export const useInventoryStore = create<InventoryState>((set, get) => ({
  ...seed,
  variants: initialVariants,
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

  receiveStockOnVariant: (shopId, userEmail, variantId, values) => {
    const state = get()
    const variant = state.variants.find((v) => v.id === variantId && v.shopId === shopId)
    if (!variant) return { ok: false, message: 'Product not found.' }
    const warehouseId = warehouseForBranch(values.branchId)
    if (!warehouseId) return { ok: false, message: 'Unknown branch.' }

    const baseKind = variant.baseKind
    let purchaseCostPerBase = values.purchaseCost
    let sellingCostPerBase = values.sellingCost
    if (baseKind === 'volume' && values.defaultDisplayUnit === 'L') {
      purchaseCostPerBase = values.purchaseCost / 1000
      sellingCostPerBase = values.sellingCost / 1000
    }
    if (baseKind === 'mass' && values.defaultDisplayUnit === 'kg') {
      purchaseCostPerBase = values.purchaseCost / 1000
      sellingCostPerBase = values.sellingCost / 1000
    }
    let qtyBase: number
    try {
      qtyBase = convertToBase(values.qty, values.defaultDisplayUnit, baseKind, variant.densityKgPerL ?? 1.1)
    } catch {
      return { ok: false, message: 'Invalid quantity unit.' }
    }

    const batchId = `bat-${Date.now()}`
    const batch: StockBatch = {
      id: batchId,
      variantId,
      batchNo: `B-RCV-${Date.now().toString().slice(-4)}`,
      mfgDate: new Date().toISOString().slice(0, 10),
      expiryDate: values.expiryDate,
      qtyBase,
      costRatePerBase: purchaseCostPerBase,
      location: state.warehouses.find((w) => w.id === warehouseId)?.name ?? 'Store',
      warehouseId,
    }
    const movement: StockMovement = {
      id: movementId(),
      shopId,
      at: new Date().toISOString(),
      type: 'purchase',
      variantId,
      batchId,
      qtyDeltaBase: qtyBase,
      costRatePerBase: purchaseCostPerBase,
      warehouseId,
      userEmail,
      reference: `PO-RCV-${state.movements.length + 1}`,
      note: 'Stock received on existing SKU',
    }
    set({
      variants: state.variants.map((v) =>
        v.id === variantId
          ? {
              ...v,
              purchaseCostPerBase,
              sellingCostPerBase,
              warehouseId,
              warehouseName: state.warehouses.find((w) => w.id === warehouseId)?.name ?? v.warehouseName,
            }
          : v
      ),
      batches: [...state.batches, batch],
      movements: [movement, ...state.movements],
    })
    return { ok: true }
  },

  upsertBrand: (shopId, input) => {
    const state = get()
    const id = input.id ?? `brand-${Date.now()}`
    const prev = state.brands.find((b) => b.id === id)
    const row: InventoryBrand = {
      id,
      shopId,
      name: input.name.trim(),
      active: input.active,
      pocName: input.pocName?.trim() || undefined,
      pocPhone: input.pocPhone?.trim() || undefined,
      dealerNumber: input.dealerNumber?.trim() || undefined,
      dealerEmail: input.dealerEmail?.trim() || undefined,
    }
    const exists = Boolean(prev)
    const variants =
      prev && prev.name !== row.name
        ? state.variants.map((v) =>
            v.shopId === shopId && (v.brandId === id || v.brand === prev.name)
              ? { ...v, brand: row.name, brandId: id }
              : v
          )
        : state.variants.map((v) =>
            v.shopId === shopId && v.brandId === id ? { ...v, brand: row.name } : v
          )
    set({
      brands: exists ? state.brands.map((b) => (b.id === id ? row : b)) : [...state.brands, row],
      variants,
    })
    return id
  },

  upsertCategory: (shopId, input) => {
    const state = get()
    const id = input.id ?? `cat-${Date.now()}`
    const prev = state.categories.find((c) => c.id === id)
    const row: InventoryCategory = {
      id,
      shopId,
      name: input.name.trim(),
      description: input.description,
      kind: input.kind,
      active: input.active,
      defaultDisplayUnit: input.defaultDisplayUnit,
    }
    const exists = Boolean(prev)
    const variants =
      prev && prev.name !== row.name
        ? state.variants.map((v) =>
            v.shopId === shopId && v.categoryId === id ? { ...v, categoryName: row.name } : v
          )
        : state.variants
    set({
      categories: exists ? state.categories.map((c) => (c.id === id ? row : c)) : [...state.categories, row],
      variants,
    })
    return id
  },

  saveStockEntry: (shopId, userEmail, values, editVariantId) => {
    const state = get()
    if (values.receiveFromVariantId && !editVariantId) {
      const received = get().receiveStockOnVariant(shopId, userEmail, values.receiveFromVariantId, values)
      if (!received.ok) return received
      return { ok: true, variantId: values.receiveFromVariantId }
    }
    const warehouseId = warehouseForBranch(values.branchId)
    if (!warehouseId) {
      return { ok: false, message: 'Unknown branch — pick Branch A or B.' }
    }
    const warehouse = state.warehouses.find((w) => w.id === warehouseId)
    const category = state.categories.find((c) => c.id === values.categoryId && c.shopId === shopId)
    if (!category || !category.active) return { ok: false, message: 'Invalid or inactive category.' }
    const brand = state.brands.find((b) => b.id === values.brandId && b.shopId === shopId)
    if (!brand || !brand.active) return { ok: false, message: 'Invalid or inactive brand.' }

    const baseKind =
      values.defaultDisplayUnit === 'nos'
        ? ('count' as const)
        : values.defaultDisplayUnit === 'kg' || values.defaultDisplayUnit === 'g'
          ? ('mass' as const)
          : ('volume' as const)

    let purchaseCostPerBase = values.purchaseCost
    let sellingCostPerBase = values.sellingCost
    if (baseKind === 'volume' && (values.defaultDisplayUnit === 'L' || values.defaultDisplayUnit === 'ml')) {
      if (values.defaultDisplayUnit === 'L') {
        purchaseCostPerBase = values.purchaseCost / 1000
        sellingCostPerBase = values.sellingCost / 1000
      }
    }
    if (baseKind === 'mass' && (values.defaultDisplayUnit === 'kg' || values.defaultDisplayUnit === 'g')) {
      if (values.defaultDisplayUnit === 'kg') {
        purchaseCostPerBase = values.purchaseCost / 1000
        sellingCostPerBase = values.sellingCost / 1000
      }
    }

    let qtyBase: number
    try {
      qtyBase = convertToBase(values.qty, values.defaultDisplayUnit, baseKind, 1.1)
    } catch {
      return { ok: false, message: 'Invalid quantity unit.' }
    }

    const existing = editVariantId ? state.variants.find((v) => v.id === editVariantId) : undefined

    const variantId = editVariantId ?? `var-${Date.now()}`
    const variant: ProductVariant = {
      id: variantId,
      shopId,
      productId: `prod-${variantId}`,
      productName: values.productName,
      brandId: brand.id,
      brand: brand.name,
      categoryId: category.id,
      categoryName: category.name,
      shadeName: category.kind === 'paint' ? (values.shadeName ?? '—') : (values.shadeName?.trim() || '—'),
      shadeHex: category.kind === 'paint' ? (values.shadeHex ?? '#E8E2D4') : (values.shadeHex ?? '#D8D2C8'),
      packLabel: values.packLabel,
      sku: editVariantId
        ? (state.variants.find((v) => v.id === editVariantId)?.sku ?? `SKU-${variantId.slice(-4)}`)
        : `SKU-${brand.name.slice(0, 2).toUpperCase()}-${Date.now().toString().slice(-5)}`,
      barcode: `${8901030580000 + state.variants.length}`,
      warehouseId,
      warehouseName: warehouse?.name ?? 'Store',
      baseKind,
      defaultDisplayUnit: values.defaultDisplayUnit,
      densityKgPerL: baseKind === 'volume' ? 1.1 : undefined,
      reorderLevelBase: baseKind === 'count' ? 10 : 5000,
      purchaseCostPerBase,
      sellingCostPerBase,
      maxDiscountPercent: existing?.maxDiscountPercent ?? DEFAULT_MAX_DISCOUNT_PERCENT,
    }

    if (editVariantId) {
      set({
        variants: state.variants.map((v) => (v.id === editVariantId ? variant : v)),
        batches: state.batches.map((b) =>
          b.variantId === editVariantId
            ? { ...b, qtyBase, costRatePerBase: purchaseCostPerBase, expiryDate: values.expiryDate, warehouseId }
            : b
        ),
      })
      return { ok: true, variantId: editVariantId }
    }

    const batchId = `bat-${Date.now()}`
    const batch: StockBatch = {
      id: batchId,
      variantId,
      batchNo: `B-NEW-${Date.now().toString().slice(-4)}`,
      mfgDate: new Date().toISOString().slice(0, 10),
      expiryDate: values.expiryDate,
      qtyBase,
      costRatePerBase: purchaseCostPerBase,
      location: warehouse?.name ?? 'Store floor',
      warehouseId,
    }

    const movement: StockMovement = {
      id: movementId(),
      shopId,
      at: new Date().toISOString(),
      type: 'purchase',
      variantId,
      batchId,
      qtyDeltaBase: qtyBase,
      costRatePerBase: purchaseCostPerBase,
      warehouseId,
      userEmail,
      reference: `PO-NEW-${state.movements.length + 1}`,
      note: 'Manual stock entry',
    }

    set({
      variants: [...state.variants, variant],
      batches: [...state.batches, batch],
      movements: [movement, ...state.movements],
    })

    return { ok: true, variantId }
  },

  deleteStockEntry: (shopId, variantId) => {
    const state = get()
    set({
      variants: state.variants.filter((v) => !(v.id === variantId && v.shopId === shopId)),
      batches: state.batches.filter((b) => b.variantId !== variantId),
      movements: state.movements.filter((m) => m.variantId !== variantId),
    })
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