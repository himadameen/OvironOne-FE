export type DisplayUnit = 'L' | 'ml' | 'kg' | 'g' | 'nos'

export type BaseUnitKind = 'volume' | 'mass' | 'count'

export type StockQuickFilter = 'all' | 'low' | 'expiring' | 'expired' | 'oos'

export type MovementType =
  | 'purchase'
  | 'adjustment'
  | 'transfer'
  | 'sale'
  | 'opening'

export type AdjustmentReason =
  | 'wastage'
  | 'damage'
  | 'expiry'
  | 'correction'
  | 'sample'
  | 'transfer'

export type StockHealth = 'ok' | 'low' | 'oos' | 'expired' | 'expiring'

export interface InventoryCategory {
  id: string
  shopId: string
  name: string
  description?: string
}

export interface ProductVariant {
  id: string
  shopId: string
  productId: string
  productName: string
  brand: string
  categoryId: string
  categoryName: string
  shadeName: string
  shadeHex: string
  packLabel: string
  sku: string
  barcode: string
  warehouseId: string
  warehouseName: string
  baseKind: BaseUnitKind
  defaultDisplayUnit: DisplayUnit
  densityKgPerL?: number
  reorderLevelBase: number
  purchaseCostPerBase: number
  sellingCostPerBase: number
}

export interface StockBatch {
  id: string
  variantId: string
  batchNo: string
  mfgDate: string
  expiryDate: string
  qtyBase: number
  costRatePerBase: number
  location: string
  warehouseId: string
}

export interface StockMovement {
  id: string
  shopId: string
  at: string
  type: MovementType
  variantId: string
  batchId?: string
  qtyDeltaBase: number
  costRatePerBase?: number
  warehouseId: string
  userEmail: string
  reference: string
  note?: string
  reason?: AdjustmentReason
}

export interface Warehouse {
  id: string
  shopId: string
  name: string
}