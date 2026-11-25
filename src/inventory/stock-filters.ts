export type StockSort =
  | 'purchase-desc'
  | 'purchase-asc'
  | 'qty-desc'
  | 'qty-asc'
  | 'margin-desc'
  | 'margin-asc'

export type ExpiryFilter = 'all' | 'expiring' | 'expired' | 'ok'
export type MarginFilter = 'all' | 'high' | 'low'

export interface StocksFilterState {
  search: string
  brandFilter: string
  categoryFilter: string
  expiryFilter: ExpiryFilter
  marginFilter: MarginFilter
  stockSort: StockSort
  inStockOnly: boolean
}

export const DEFAULT_STOCK_FILTERS: StocksFilterState = {
  search: '',
  brandFilter: 'all',
  categoryFilter: 'all',
  expiryFilter: 'all',
  marginFilter: 'all',
  stockSort: 'purchase-desc',
  inStockOnly: false,
}

export const STOCK_PAGE_SIZES = [5, 10, 25, 50] as const

export const STOCK_SORT_LABELS: Record<StockSort, string> = {
  'purchase-desc': 'Purc cost · high to low',
  'purchase-asc': 'Purc cost · low to high',
  'qty-desc': 'Qty · high to low',
  'qty-asc': 'Qty · low to high',
  'margin-desc': 'Margin · high to low',
  'margin-asc': 'Margin · low to high',
}