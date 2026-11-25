import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Plus,
  Trash2,
  Search,
} from 'lucide-react'
import { ExpiryBadge } from '@/components/inventory/ExpiryBadge'
import { ShadeSwatch } from '@/components/inventory/ShadeSwatch'
import { StocksFilterPanel } from '@/components/inventory/StocksFilterPanel'
import { StockFormModal } from '@/components/inventory/StockFormModal'
import { InventorySubnav } from '@/components/inventory/InventorySubnav'
import { StockTradeHistoryDialog } from '@/components/inventory/StockTradeHistoryDialog'
import { YearTargetStatus } from '@/components/inventory/YearTargetStatus'
import {
  DEFAULT_STOCK_FILTERS,
  STOCK_PAGE_SIZES,
  STOCK_SORT_LABELS,
  type StockSort,
  type StocksFilterState,
} from '@/inventory/stock-filters'
import { branchLabelForWarehouse, warehouseIdsForBranchFilter } from '@/inventory/branch-warehouses'
import { downloadCsv } from '@/inventory/csv'
import { daysUntilExpiry } from '@/inventory/expiry'
import { filterBatchesByBranch, computeStockDashboard, type PurchasePeriod } from '@/inventory/stock-metrics'
import { qtyOnHandDisplay, ratePerDisplayUnit } from '@/inventory/display'
import { formatInventoryDate } from '@/inventory/format-date'
import { formatInr, marginPercent } from '@/inventory/format-money'
import {
  maxDiscountPercentFor,
  sellingPriceAfterMaxDiscount,
} from '@/inventory/pricing'
import { totalQtyBase } from '@/inventory/fifo'
import type { StockFormValues } from '@/inventory/stock-form-schema'
import { STOCK_SHORT } from '@/inventory/stock-labels'
import { totalPurchasedQtyBase } from '@/inventory/stock-quantity'
import type { ProductVariant, StockBatch, StockMovement } from '@/inventory/types'
import { branchesForShop } from '@/data/mock-branches'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { confirmDialog } from '@/stores/confirm-dialog-store'
import { useInventoryStore } from '@/stores/inventory-store'
import { useStocksTargetsStore, yearTargetsForShop } from '@/stores/stocks-targets-store'
import type { BranchFilter } from '@/stores/shop-workspace-store'
import {
  availableTradeYears,
  brandLeaders,
  monthlyTradeRows,
} from '@/inventory/trade-history'

type LineTab = 'all' | 'expired' | 'in-date' | 'in-stk'
type TableDensity = 'comfortable' | 'compact'

interface StockRow {
  variant: ProductVariant
  qtyBase: number
  purchasedBase: number
  nearestExpiry?: { expiryDate: string }
  margin: number
  expiryDays: number | null
}

function buildRows(
  shopId: string,
  variants: ProductVariant[],
  batches: StockBatch[],
  movements: StockMovement[],
  warehouseIds: string[] | null,
  filters: StocksFilterState
): StockRow[] {
  let list = variants.filter((v) => v.shopId === shopId)
  if (warehouseIds) list = list.filter((v) => warehouseIds.includes(v.warehouseId))
  if (filters.brandFilter !== 'all') list = list.filter((v) => v.brand === filters.brandFilter)
  if (filters.categoryFilter !== 'all') list = list.filter((v) => v.categoryId === filters.categoryFilter)
  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase()
    list = list.filter(
      (v) =>
        v.productName.toLowerCase().includes(q) ||
        v.sku.toLowerCase().includes(q) ||
        v.shadeName.toLowerCase().includes(q)
    )
  }

  let rows: StockRow[] = list.map((variant) => {
    const variantBatches = filterBatchesByBranch(
      batches.filter((b) => b.variantId === variant.id),
      warehouseIds
    )
    const qtyBase = totalQtyBase(variantBatches)
    const nearestExpiry = variantBatches
      .filter((b) => b.qtyBase > 0)
      .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate))[0]
    const margin = marginPercent(variant.sellingCostPerBase, variant.purchaseCostPerBase)
    const expiryDays = nearestExpiry ? daysUntilExpiry(nearestExpiry.expiryDate) : null
    const purchasedBase = totalPurchasedQtyBase(shopId, variant.id, warehouseIds, movements, qtyBase)
    return { variant, qtyBase, purchasedBase, nearestExpiry, margin, expiryDays }
  })

  if (filters.marginFilter === 'high') rows = rows.filter((r) => r.margin >= 25)
  if (filters.marginFilter === 'low') rows = rows.filter((r) => r.margin < 20)
  if (filters.expiryFilter !== 'all') {
    rows = rows.filter((r) => {
      if (r.expiryDays === null) return filters.expiryFilter === 'ok'
      if (filters.expiryFilter === 'expired') return r.expiryDays < 0
      if (filters.expiryFilter === 'expiring') return r.expiryDays >= 0 && r.expiryDays <= 30
      if (filters.expiryFilter === 'ok') return r.expiryDays > 30
      return true
    })
  }

  rows = [...rows].sort((a, b) => {
    switch (filters.stockSort) {
      case 'purchase-asc':
        return a.variant.purchaseCostPerBase - b.variant.purchaseCostPerBase
      case 'purchase-desc':
        return b.variant.purchaseCostPerBase - a.variant.purchaseCostPerBase
      case 'qty-asc':
        return a.qtyBase - b.qtyBase
      case 'qty-desc':
        return b.qtyBase - a.qtyBase
      case 'margin-asc':
        return a.margin - b.margin
      case 'margin-desc':
        return b.margin - a.margin
      default:
        return b.variant.purchaseCostPerBase - a.variant.purchaseCostPerBase
    }
  })

  return rows
}

export function InventoryStocksPage() {
  const shopId = useAuthStore((s) => s.shopId) ?? 'shop-ambur'
  const email = useAuthStore((s) => s.email) ?? 'admin@demo'
  const variants = useInventoryStore((s) => s.variants)
  const batches = useInventoryStore((s) => s.batches)
  const movements = useInventoryStore((s) => s.movements)
  const categories = useInventoryStore((s) => s.categories)
  const catalogBrands = useInventoryStore((s) => s.brands)
  const saveStockEntry = useInventoryStore((s) => s.saveStockEntry)
  const deleteStockEntry = useInventoryStore((s) => s.deleteStockEntry)

  const [branchId, setBranchId] = useState<BranchFilter>('all')
  const [purchasePeriod, setPurchasePeriod] = useState<PurchasePeriod>('month')
  const [filters, setFilters] = useState<StocksFilterState>(DEFAULT_STOCK_FILTERS)
  const [lineTab, setLineTab] = useState<LineTab>('all')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [density, setDensity] = useState<TableDensity>('compact')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [expiryOpen, setExpiryOpen] = useState(false)
  const [tradeHistoryOpen, setTradeHistoryOpen] = useState(false)
  const [tradeHistoryFocus, setTradeHistoryFocus] = useState<'purchase' | 'sale'>('purchase')
  const [tradeHistoryYear, setTradeHistoryYear] = useState(() => new Date().getFullYear())
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<ProductVariant | null>(null)

  const branches = branchesForShop(shopId)
  const warehouseIds = warehouseIdsForBranchFilter(shopId, branchId)

  const metrics = useMemo(
    () => computeStockDashboard(shopId, variants, batches, movements, branchId, purchasePeriod),
    [shopId, variants, batches, movements, branchId, purchasePeriod]
  )

  const tradeYears = useMemo(() => availableTradeYears(movements, shopId), [movements, shopId])

  const calendarYear = new Date().getFullYear()
  const byShopTargets = useStocksTargetsStore((s) => s.byShop)
  const yearTargets = yearTargetsForShop(byShopTargets, shopId, calendarYear)
  const tradeDialogTargets = yearTargetsForShop(byShopTargets, shopId, tradeHistoryYear)
  const setYearTargets = useStocksTargetsStore((s) => s.setYearTargets)

  const yearSaleActual = useMemo(() => {
    const rows = monthlyTradeRows(movements, variants, shopId, branchId, calendarYear)
    return rows.reduce((sum, r) => sum + r.saleTotal, 0)
  }, [movements, variants, shopId, branchId, calendarYear])

  const tradeHistoryData = useMemo(() => {
    const yearRef = new Date(tradeHistoryYear, 6, 1)
    return {
      months: monthlyTradeRows(movements, variants, shopId, branchId, tradeHistoryYear),
      purchaseBrands: brandLeaders(
        movements,
        variants,
        shopId,
        branchId,
        'purchase',
        'year',
        yearRef
      ),
      saleBrands: brandLeaders(movements, variants, shopId, branchId, 'sale', 'year', yearRef),
    }
  }, [movements, variants, shopId, branchId, tradeHistoryYear])

  const openTradeHistory = (focus: 'purchase' | 'sale') => {
    setTradeHistoryFocus(focus)
    setTradeHistoryOpen(true)
  }

  const brands = useMemo(
    () =>
      Array.from(new Set(variants.filter((v) => v.shopId === shopId).map((v) => v.brand))).sort(),
    [variants, shopId]
  )

  const shopCategories = useMemo(
    () => categories.filter((c) => c.shopId === shopId && c.active),
    [categories, shopId]
  )

  const shopCatalogBrands = useMemo(
    () => catalogBrands.filter((b) => b.shopId === shopId),
    [catalogBrands, shopId]
  )

  const { tabCounts, stockRows } = useMemo(() => {
    const base = buildRows(shopId, variants, batches, movements, warehouseIds, filters)
    const tabCounts = {
      all: base.length,
      expired: base.filter((r) => r.expiryDays !== null && r.expiryDays < 0).length,
      inDate: base.filter((r) => r.expiryDays === null || r.expiryDays > 30).length,
      inStk: base.filter((r) => r.qtyBase > 0).length,
    }
    let rows = base
    if (lineTab === 'expired') rows = rows.filter((r) => r.expiryDays !== null && r.expiryDays < 0)
    if (lineTab === 'in-date') rows = rows.filter((r) => r.expiryDays === null || r.expiryDays > 30)
    if (lineTab === 'in-stk') rows = rows.filter((r) => r.qtyBase > 0)
    return { tabCounts, stockRows: rows }
  }, [shopId, variants, batches, movements, warehouseIds, filters, lineTab])

  const totalPages = Math.max(1, Math.ceil(stockRows.length / pageSize))

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const pageRows = stockRows.slice((page - 1) * pageSize, page * pageSize)
  const selectedCount = selected.size
  const allPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.variant.id))

  const activeRefineCount = useMemo(() => {
    let n = 0
    if (filters.brandFilter !== 'all') n += 1
    if (filters.categoryFilter !== 'all') n += 1
    if (filters.expiryFilter !== 'all') n += 1
    if (filters.marginFilter !== 'all') n += 1
    return n
  }, [filters])

  const patchFilters = (patch: Partial<StocksFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }))
    setPage(1)
  }

  const exportRows = (rows: StockRow[]) => {
    downloadCsv(
      'stocks-export.csv',
      ['Product', 'Brand', 'Branch', 'In stock', 'Cost', 'Selling', 'Max disc sell', 'Expiry'],
      rows.map(({ variant, qtyBase, purchasedBase, nearestExpiry }) => {
        const discPct = maxDiscountPercentFor(variant)
        const floorBase = sellingPriceAfterMaxDiscount(variant.sellingCostPerBase, discPct)
        return [
          variant.productName,
          variant.brand,
          branchLabelForWarehouse(shopId, variant.warehouseId),
          `${qtyOnHandDisplay(qtyBase, variant)} (${qtyOnHandDisplay(purchasedBase, variant)} purchased)`,
          ratePerDisplayUnit(variant.purchaseCostPerBase, variant),
          ratePerDisplayUnit(variant.sellingCostPerBase, variant),
          ratePerDisplayUnit(floorBase, variant),
          nearestExpiry ? formatInventoryDate(nearestExpiry.expiryDate) : '',
        ]
      })
    )
  }

  const onSave = (values: StockFormValues, editId?: string) => {
    const result = saveStockEntry(shopId, email, values, editId)
    if (!result.ok) {
      void confirmDialog({ title: 'Could not save', message: result.message, alertOnly: true })
    }
  }

  const onDelete = (variant: ProductVariant) => {
    void confirmDialog({
      title: 'Remove stock line?',
      message: `Remove ${variant.productName} (${variant.sku})?`,
      confirmLabel: 'Remove',
      variant: 'danger',
    }).then((ok) => {
      if (ok) {
        deleteStockEntry(shopId, variant.id)
        setSelected((prev) => {
          const next = new Set(prev)
          next.delete(variant.id)
          return next
        })
      }
    })
  }

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAllPage = () => {
    if (allPageSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        pageRows.forEach((r) => next.delete(r.variant.id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        pageRows.forEach((r) => next.add(r.variant.id))
        return next
      })
    }
  }

  return (
    <div className="page-wrap stocks-page">
      <div className="stocks-catalog-subnav">
        <InventorySubnav />
      </div>
      <header className="stocks-hero card-widget stocks-hero--compact">
        <div className="stocks-hero-top">
          <div className="stocks-hero-copy">
            <h1 className="stocks-hero-title">Stocks</h1>
            <p className="stocks-hero-desc">
              Paint and materials by branch. Purchase totals use date only (no time).
            </p>
          </div>
          <div className="stocks-hero-aside">
            <div className="stocks-branch-toggle" role="group" aria-label="Branch">
              {(['all', ...branches.map((b) => b.id)] as const).map((id) => {
                const label =
                  id === 'all'
                    ? 'All'
                    : (branches.find((b) => b.id === id)?.name.split('—')[0]?.trim() ?? id)
                return (
                  <button
                    key={id}
                    type="button"
                    className={cn('stocks-branch-chip', branchId === id && 'stocks-branch-chip--active')}
                    aria-pressed={branchId === id}
                    onClick={() => setBranchId(id)}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <div className="stocks-hero-actions">
              <button
                type="button"
                className="btn-secondary stocks-hero-btn"
                onClick={() => exportRows(stockRows)}
              >
                <Download className="h-4 w-4" aria-hidden />
                Export
              </button>
              <button
                type="button"
                className="btn-primary stocks-hero-btn"
                onClick={() => {
                  setEditing(null)
                  setFormOpen(true)
                }}
              >
                <Plus className="h-4 w-4" aria-hidden />
                Add stock
              </button>
            </div>
          </div>
        </div>

        <section className="stocks-kpi-strip" aria-label="Stock summary">
          <article className="stocks-kpi-cell">
            <p className="stocks-kpi-v2-label">Total SKUs</p>
            <p className="stocks-kpi-v2-value">{metrics.totalSkus}</p>
            <p className="stocks-kpi-v2-hint">{branches.length} br</p>
          </article>
          <button
            type="button"
            className="stocks-kpi-cell stocks-kpi-cell--clickable text-left"
            onClick={() => openTradeHistory('purchase')}
          >
            <div className="stocks-kpi-v2-head">
              <p className="stocks-kpi-v2-label">{STOCK_SHORT.purchasedKpi}</p>
              <div className="stocks-period-toggle">
                {(['month', 'year'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={cn('stocks-period-chip', purchasePeriod === p && 'stocks-period-chip--active')}
                    onClick={(e) => {
                      e.stopPropagation()
                      setPurchasePeriod(p)
                    }}
                  >
                    {p === 'month' ? 'Mo' : 'Yr'}
                  </button>
                ))}
              </div>
            </div>
            <p className="stocks-kpi-v2-value">{formatInr(metrics.purchaseTotal)}</p>
            <p className="stocks-kpi-v2-hint stocks-kpi-v2-hint--tight">
              {metrics.purchaseTrend === 'up' ? (
                <ArrowUpRight className="inline h-3 w-3 text-[#1f6b47]" aria-hidden />
              ) : (
                <ArrowDownRight className="inline h-3 w-3 text-brand-secondary" aria-hidden />
              )}{' '}
              {formatInr(metrics.purchaseDelta)} vs prior · History →
            </p>
          </button>
          <button
            type="button"
            className="stocks-kpi-cell stocks-kpi-cell--clickable text-left"
            onClick={() => openTradeHistory('sale')}
          >
            <div className="stocks-kpi-v2-head">
              <p className="stocks-kpi-v2-label">{STOCK_SHORT.saleKpi}</p>
            </div>
            <p className="stocks-kpi-v2-value">{formatInr(metrics.saleTotal)}</p>
            <p className="stocks-kpi-v2-hint stocks-kpi-v2-hint--tight">
              {metrics.saleTrend === 'up' ? (
                <ArrowUpRight className="inline h-3 w-3 text-[#1f6b47]" aria-hidden />
              ) : (
                <ArrowDownRight className="inline h-3 w-3 text-brand-secondary" aria-hidden />
              )}{' '}
              {formatInr(metrics.saleDelta)} vs prior
            </p>
            {yearTargets.saleTargetInr > 0 ? (
              <YearTargetStatus
                variant="compact"
                label="Yr sale"
                actual={yearSaleActual}
                target={yearTargets.saleTargetInr}
              />
            ) : (
              <p className="stocks-kpi-target stocks-kpi-target--muted">Set yr target →</p>
            )}
          </button>
          <button
            type="button"
            className="stocks-kpi-cell stocks-kpi-cell--alert text-left"
            onClick={() => {
              setLineTab('expired')
              setPage(1)
              setExpiryOpen(true)
            }}
          >
            <p className="stocks-kpi-v2-label">{STOCK_SHORT.expiring}</p>
            <p className="stocks-kpi-v2-value">{metrics.expiryCount}</p>
            <p className="stocks-kpi-v2-link">Review →</p>
          </button>
          <article className="stocks-kpi-cell">
            <p className="stocks-kpi-v2-label">Rem value</p>
            <p className="stocks-kpi-v2-value">{formatInr(metrics.remainingValue)}</p>
            <p className="stocks-kpi-v2-hint">{metrics.inStockSkus} w/ qty</p>
          </article>
        </section>
      </header>

      <section className="stocks-list-card card-widget !p-0">
        <div className="stocks-list-toolbar">
          <label className="stocks-list-search">
            <Search className="h-4 w-4 text-muted" aria-hidden />
            <input
              type="search"
              placeholder="Search product, SKU or shade"
              value={filters.search}
              onChange={(e) => patchFilters({ search: e.target.value })}
            />
          </label>
          <button
            type="button"
            className={cn('btn-secondary !h-10 stocks-toolbar-filters', filtersOpen && 'stocks-toolbar-filters--open')}
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
          >
            <Filter className="mr-1.5 inline h-4 w-4" />
            Filters
            {activeRefineCount > 0 ? (
              <span className="stocks-filter-count" aria-label={`${activeRefineCount} active filters`}>
                {activeRefineCount}
              </span>
            ) : null}
          </button>
          <label className="stocks-toolbar-sort">
            {/* <span className="stocks-toolbar-sort-label">Sort</span> */}
            <select
              className="stocks-filter-select stocks-toolbar-sort-select"
              value={filters.stockSort}
              onChange={(e) => patchFilters({ stockSort: e.target.value as StockSort })}
              aria-label="Sort stock lines"
            >
              {(Object.entries(STOCK_SORT_LABELS) as [StockSort, string][]).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="stocks-density-toggle" role="group" aria-label="Table density">
            {(
              [
                ['comfortable', 'Comfortable'],
                ['compact', 'Compact'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={cn('stocks-density-chip', density === id && 'stocks-density-chip--active')}
                aria-pressed={density === id}
                onClick={() => setDensity(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className={cn('stocks-filter-drawer', filtersOpen && 'stocks-filter-drawer--open')}>
          <div className="stocks-filter-drawer-inner">
            <StocksFilterPanel
              compactLabels
              filters={filters}
              brands={brands}
              categories={shopCategories}
              onChange={patchFilters}
              onReset={() => {
                setFilters(DEFAULT_STOCK_FILTERS)
                setPage(1)
              }}
            />
          </div>
        </div>

        <div className="stocks-line-tabs" role="tablist" aria-label="Stock line filters">
          {(
            [
              ['all', `${STOCK_SHORT.allLines} (${tabCounts.all})`],
              ['expired', `${STOCK_SHORT.expired} (${tabCounts.expired})`],
              ['in-date', `${STOCK_SHORT.inDate} (${tabCounts.inDate})`],
              ['in-stk', `${STOCK_SHORT.inStk} (${tabCounts.inStk})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={lineTab === id}
              className={cn('stocks-line-tab', lineTab === id && 'stocks-line-tab--active')}
              onClick={() => {
                setLineTab(id)
                setPage(1)
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {selectedCount > 0 ? (
          <div className="stocks-selection-bar">
            <span>{selectedCount} selected</span>
            <button type="button" onClick={() => exportRows(stockRows.filter((r) => selected.has(r.variant.id)))}>
              Export
            </button>
            <button type="button" onClick={() => setFormOpen(true)}>
              Update price
            </button>
            <button
              type="button"
              onClick={() => {
                void confirmDialog({
                  title: 'Delete selected?',
                  message: `Remove ${selectedCount} stock line(s)?`,
                  variant: 'danger',
                  confirmLabel: 'Delete',
                }).then((ok) => {
                  if (ok) {
                    selected.forEach((id) => deleteStockEntry(shopId, id))
                    setSelected(new Set())
                  }
                })
              }}
            >
              Delete
            </button>
            <button type="button" onClick={() => setSelected(new Set())}>
              Clear
            </button>
          </div>
        ) : null}

        <div
          className={cn(
            'stocks-table-shell stocks-table-shell--flat',
            density === 'compact' ? 'stocks-table--compact' : 'stocks-table--comfortable'
          )}
        >
          <div className="inv-table-scroll stocks-table stocks-table-v2">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-10">
                    <input
                      type="checkbox"
                      className="stocks-checkbox"
                      checked={allPageSelected}
                      onChange={toggleAllPage}
                      aria-label="Select all on page"
                    />
                  </th>
                  <th>Product</th>
                  <th>Branch</th>
                  <th className="stocks-instock-col">In stock</th>
                  <th>Cost</th>
                  <th>Selling</th>
                  <th className="whitespace-nowrap">{STOCK_SHORT.discSell}</th>
                  <th className="whitespace-nowrap">{STOCK_SHORT.expiry}</th>
                  <th className="stocks-table-actions-col" />
                </tr>
              </thead>
              <tbody>
                {pageRows.map(({ variant, qtyBase, purchasedBase, nearestExpiry }) => {
                  const isSelected = selected.has(variant.id)
                  return (
                    <tr key={variant.id} className={cn(isSelected && 'stocks-row--selected')}>
                      <td>
                        <input
                          type="checkbox"
                          className="stocks-checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(variant.id)}
                          aria-label={`Select ${variant.productName}`}
                        />
                      </td>
                      <td>
                        <div className="stocks-product-cell">
                          <ShadeSwatch hex={variant.shadeHex} shadeName={variant.shadeName} />
                          <div className="stocks-product-text">
                            <p className="stocks-product-name">{variant.productName}</p>
                            <p className="stocks-product-meta">
                              {variant.brand} · {variant.packLabel} · {variant.categoryName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">
                        <span className="stocks-branch-pill">
                          {branchLabelForWarehouse(shopId, variant.warehouseId)}
                        </span>
                      </td>
                      <td className="stocks-qty-cell">
                        <p className="stocks-qty-remaining" title="Remaining">
                          {qtyOnHandDisplay(qtyBase, variant)} {STOCK_SHORT.remaining}
                        </p>
                        <p className="stocks-qty-purchased" title="Purchased">
                          {qtyOnHandDisplay(purchasedBase, variant)} {STOCK_SHORT.purchased}
                        </p>
                      </td>
                      <td className="whitespace-nowrap text-sm tabular-nums">
                        {ratePerDisplayUnit(variant.purchaseCostPerBase, variant)}
                      </td>
                      <td className="whitespace-nowrap text-sm tabular-nums">
                        {ratePerDisplayUnit(variant.sellingCostPerBase, variant)}
                      </td>
                      <td className="whitespace-nowrap text-sm tabular-nums">
                        {(() => {
                          const discPct = maxDiscountPercentFor(variant)
                          const floorBase = sellingPriceAfterMaxDiscount(
                            variant.sellingCostPerBase,
                            discPct
                          )
                          return (
                            <span
                              title={`List ${ratePerDisplayUnit(variant.sellingCostPerBase, variant)} · max ${discPct}% off`}
                            >
                              {ratePerDisplayUnit(floorBase, variant)}
                            </span>
                          )
                        })()}
                      </td>
                      <td>
                        {nearestExpiry ? (
                          <div className="stocks-expiry-cell">
                            <ExpiryBadge
                              compact
                              expiryDate={nearestExpiry.expiryDate}
                              className="stocks-expiry-badge"
                            />
                            <span className="stocks-expiry-date">{formatInventoryDate(nearestExpiry.expiryDate)}</span>
                          </div>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="stocks-table-actions-cell">
                        <div className="stocks-table-actions">
                          <button
                            type="button"
                            className="stocks-action-btn"
                            onClick={() => {
                              setEditing(variant)
                              setFormOpen(true)
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="stocks-icon-btn stocks-icon-btn--danger"
                            aria-label={`Delete ${variant.productName}`}
                            onClick={() => onDelete(variant)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <footer className="stocks-pagination">
            <p className="stocks-pagination-meta">
              Showing <strong>{pageRows.length}</strong> of <strong>{stockRows.length}</strong> lines
            </p>
            <label className="stocks-page-size">
              <span className="text-xs font-medium text-muted">Rows per page</span>
              <select
                className="stocks-filter-select !h-9 !min-w-[4.5rem]"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value))
                  setPage(1)
                }}
              >
                {STOCK_PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <div className="stocks-pagination-nav">
              <button
                type="button"
                className="btn-secondary !h-9 !px-2.5"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium tabular-nums">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="btn-secondary !h-9 !px-2.5"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </div>

        {stockRows.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted">No stock lines match your filters.</p>
        ) : null}
      </section>

      <StockFormModal
        open={formOpen}
        shopId={shopId}
        brands={shopCatalogBrands}
        categories={categories.filter((c) => c.shopId === shopId)}
        variants={variants.filter((v) => v.shopId === shopId)}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSave={onSave}
      />

      {expiryOpen ? (
        <div className="confirm-backdrop" role="presentation" onClick={() => setExpiryOpen(false)}>
          <div className="support-dialog max-w-xl" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2 className="confirm-dialog-title">Exp lines</h2>
            <p className="confirm-dialog-message">≤30 days or already exp.</p>
            <ul className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto">
              {metrics.expiryItems.map(({ variant, batch, daysLeft }) => (
                <li key={batch.id} className="stocks-expiry-list-item">
                  <div className="flex items-center gap-2">
                    <ShadeSwatch hex={variant.shadeHex} shadeName={variant.shadeName} />
                    <div>
                      <p className="text-sm font-medium">{variant.productName}</p>
                      <p className="text-xs text-muted">
                        {variant.brand} · {batch.batchNo}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <ExpiryBadge compact expiryDate={batch.expiryDate} />
                    <p className="stocks-expiry-date">{formatInventoryDate(batch.expiryDate)}</p>
                    <p className="text-xs text-muted">{daysLeft < 0 ? STOCK_SHORT.expired : `${daysLeft}d`}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="confirm-dialog-actions">
              <button type="button" className="btn-primary !h-10 px-4 text-sm" onClick={() => setExpiryOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <StockTradeHistoryDialog
        open={tradeHistoryOpen}
        focus={tradeHistoryFocus}
        year={tradeHistoryYear}
        years={tradeYears}
        months={tradeHistoryData.months}
        purchaseBrands={tradeHistoryData.purchaseBrands}
        saleBrands={tradeHistoryData.saleBrands}
        saleTargetInr={tradeDialogTargets.saleTargetInr}
        purchaseTargetInr={tradeDialogTargets.purchaseTargetInr}
        onSaveTargets={(saleTargetInr, purchaseTargetInr) =>
          setYearTargets(shopId, tradeHistoryYear, { saleTargetInr, purchaseTargetInr })
        }
        onYearChange={setTradeHistoryYear}
        onClose={() => setTradeHistoryOpen(false)}
      />
    </div>
  )
}