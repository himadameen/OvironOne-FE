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

/** Paint needs shade; accessories (brushes, rollers) use count units, etc. */
export type InventoryCategoryKind = 'paint' | 'accessory' | 'consumable'

export interface InventoryCategory {
  id: string
  shopId: string
  name: string
  description?: string
  kind: InventoryCategoryKind
  active: boolean
  defaultDisplayUnit: DisplayUnit
  /** Pre-filled in Add stock for new SKUs */
  defaultPackLabel?: string
  /** When false, Add stock hides expiry (tools, etc.) */
  trackExpiry?: boolean
}

export interface InventoryBrand {
  id: string
  shopId: string
  name: string
  active: boolean
  pocName?: string
  pocPhone?: string
  dealerNumber?: string
  dealerEmail?: string
  gstin?: string
  territory?: string
  creditTerms?: string
}

export interface BrandFormInput {
  id?: string
  name: string
  active: boolean
  pocName?: string
  pocPhone?: string
  dealerNumber?: string
  dealerEmail?: string
  gstin?: string
  territory?: string
  creditTerms?: string
}

export interface ProductVariant {
  id: string
  shopId: string
  productId: string
  productName: string
  brandId?: string
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
  /** Max discount % off list selling price (POS floor). */
  maxDiscountPercent?: number
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
  /** Other shop (rare — multi-entity). */
  counterpartyShopId?: string
  /** Other branch warehouse in a branch transfer. */
  counterpartyWarehouseId?: string
  /** Pairs outbound + inbound ledger lines. */
  transferGroupId?: string
}

export interface Warehouse {
  id: string
  shopId: string
  name: string
}