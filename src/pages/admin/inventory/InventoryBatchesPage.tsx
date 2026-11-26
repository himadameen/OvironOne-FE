import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react'
import { InventorySectionGuide } from '@/components/inventory/InventorySectionGuide'
import { branchLabelForWarehouse } from '@/inventory/branch-warehouses'
import { InventoryCatalogPageLayout } from '@/components/inventory/InventoryCatalogPageLayout'
import { ExpiryBadge } from '@/components/inventory/ExpiryBadge'
import { ShadeSwatch } from '@/components/inventory/ShadeSwatch'
import { BatchLotDetailModal } from '@/components/inventory/BatchLotDetailModal'
import { BatchQtyFixModal } from '@/components/inventory/BatchQtyFixModal'
import { BatchBranchMoveModal } from '@/components/inventory/BatchBranchMoveModal'
import { qtyOnHandDisplay, ratePerDisplayUnit } from '@/inventory/display'
import { daysUntilExpiry } from '@/inventory/expiry'
import { formatInventoryDate } from '@/inventory/format-date'
import { formatInr } from '@/inventory/format-money'
import { STOCK_PAGE_SIZES } from '@/inventory/stock-filters'
import { STOCK_SHORT } from '@/inventory/stock-labels'
import type { ProductVariant, StockBatch } from '@/inventory/types'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { useInventoryStore } from '@/stores/inventory-store'

type LotRow = {
  batch: StockBatch
  variant: ProductVariant
  days: number
  value: number
}

type LotLineTab = 'all' | 'active' | 'expired' | 'empty'

type LotSort = 'exp-asc' | 'exp-desc' | 'qty-desc' | 'qty-asc' | 'value-desc'

const LOT_SORT_LABELS: Record<LotSort, string> = {
  'exp-asc': 'Expiry · soonest first',
  'exp-desc': 'Expiry · latest first',
  'qty-desc': 'Qty · high to low',
  'qty-asc': 'Qty · low to high',
  'value-desc': 'Value · high to low',
}

function matchesLotSearch(row: LotRow, q: string): boolean {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  const { batch, variant } = row
  const hay = [
    batch.batchNo,
    variant.sku,
    variant.productName,
    variant.shadeName,
    variant.brand,
  ]
    .join(' ')
    .toLowerCase()
  return hay.includes(needle)
}

function matchesLotTab(row: LotRow, tab: LotLineTab): boolean {
  if (tab === 'all') return true
  if (tab === 'empty') return row.batch.qtyBase <= 0
  if (tab === 'expired') return row.days < 0 && row.batch.qtyBase > 0
  return row.batch.qtyBase > 0 && row.days >= 0
}

function sortLotRows(rows: LotRow[], sort: LotSort): LotRow[] {
  const next = [...rows]
  next.sort((a, b) => {
    if (sort === 'exp-asc') return a.batch.expiryDate.localeCompare(b.batch.expiryDate)
    if (sort === 'exp-desc') return b.batch.expiryDate.localeCompare(a.batch.expiryDate)
    if (sort === 'qty-desc') return b.batch.qtyBase - a.batch.qtyBase
    if (sort === 'qty-asc') return a.batch.qtyBase - b.batch.qtyBase
    return b.value - a.value
  })
  return next
}

export function InventoryBatchesPage() {
  const shopId = useAuthStore((s) => s.shopId) ?? 'shop-ambur'
  const batches = useInventoryStore((s) => s.batches)
  const variants = useInventoryStore((s) => s.variants)
  const warehouses = useInventoryStore((s) => s.warehouses)

  const [search, setSearch] = useState('')
  const [variantId, setVariantId] = useState('all')
  const [warehouseId, setWarehouseId] = useState('all')
  const [lineTab, setLineTab] = useState<LotLineTab>('all')
  const [lotSort, setLotSort] = useState<LotSort>('exp-asc')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(STOCK_PAGE_SIZES[1])

  const [detailRow, setDetailRow] = useState<LotRow | null>(null)
  const [qtyFixTarget, setQtyFixTarget] = useState<{ variantId: string; batchId: string } | null>(null)
  const [moveTarget, setMoveTarget] = useState<{ variantId: string; batchId: string } | null>(null)

  const shopVariants = useMemo(() => variants.filter((v) => v.shopId === shopId), [variants, shopId])

  const allLotRows = useMemo(() => {
    return batches
      .map((b) => {
        const variant = shopVariants.find((v) => v.id === b.variantId)
        if (!variant) return null
        const days = daysUntilExpiry(b.expiryDate)
        const value = b.qtyBase * b.costRatePerBase
        return { batch: b, variant, days, value }
      })
      .filter((row): row is LotRow => !!row)
  }, [batches, shopVariants])

  const refinedRows = useMemo(() => {
    return allLotRows
      .filter((row) => (variantId === 'all' ? true : row.variant.id === variantId))
      .filter((row) => (warehouseId === 'all' ? true : row.batch.warehouseId === warehouseId))
      .filter((row) => matchesLotSearch(row, search))
  }, [allLotRows, variantId, warehouseId, search])

  const tabCounts = useMemo(
    () => ({
      all: refinedRows.length,
      active: refinedRows.filter((r) => matchesLotTab(r, 'active')).length,
      expired: refinedRows.filter((r) => matchesLotTab(r, 'expired')).length,
      empty: refinedRows.filter((r) => matchesLotTab(r, 'empty')).length,
    }),
    [refinedRows]
  )

  const lotRows = useMemo(() => {
    return sortLotRows(
      refinedRows.filter((row) => matchesLotTab(row, lineTab)),
      lotSort
    )
  }, [refinedRows, lineTab, lotSort])

  const totalPages = Math.max(1, Math.ceil(lotRows.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * pageSize
  const pageRows = lotRows.slice(pageStart, pageStart + pageSize)

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const activeRefineCount = (variantId !== 'all' ? 1 : 0) + (warehouseId !== 'all' ? 1 : 0)

  return (
    <InventoryCatalogPageLayout
      title="Batch lots"
      description="Each receive creates a lot (batch no., expiry, cost, branch). Stock totals on Stocks are the sum of these lots."
    >
      <InventorySectionGuide>
        Click a row to view the lot. Use <strong>Qty fix</strong> or <strong>Move</strong> on the right to open those
        actions — same table layout as Stocks.
      </InventorySectionGuide>

      <section className="stocks-list-card card-widget !p-0">
        <div className="stocks-list-toolbar">
          <label className="stocks-list-search">
            <Search className="h-4 w-4 text-muted" aria-hidden />
            <input
              type="search"
              placeholder="Search lot, SKU or product"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
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
            <select
              className="stocks-filter-select stocks-toolbar-sort-select"
              value={lotSort}
              onChange={(e) => {
                setLotSort(e.target.value as LotSort)
                setPage(1)
              }}
              aria-label="Sort batch lots"
            >
              {(Object.entries(LOT_SORT_LABELS) as [LotSort, string][]).map(([value, label]) => (
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
            <div className="stocks-filter-panel">
              <div className="stocks-filter-panel-head">
                <span className="stocks-filter-title">Refine lots</span>
                <button
                  type="button"
                  className="stocks-filter-reset"
                  onClick={() => {
                    setVariantId('all')
                    setWarehouseId('all')
                    setPage(1)
                  }}
                >
                  Reset
                </button>
              </div>
              <div className="stocks-filter-grid stocks-filter-grid--refine">
                <div className="stocks-filter-field">
                  <span className="stocks-filter-field-label">Product</span>
                  <select
                    className="stocks-filter-select"
                    value={variantId}
                    onChange={(e) => {
                      setVariantId(e.target.value)
                      setPage(1)
                    }}
                  >
                    <option value="all">All products</option>
                    {shopVariants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.sku} — {v.shadeName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="stocks-filter-field">
                  <span className="stocks-filter-field-label">Branch</span>
                  <select
                    className="stocks-filter-select"
                    value={warehouseId}
                    onChange={(e) => {
                      setWarehouseId(e.target.value)
                      setPage(1)
                    }}
                  >
                    <option value="all">All branches</option>
                    {warehouses
                      .filter((w) => w.shopId === shopId)
                      .map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="stocks-line-tabs" role="tablist" aria-label="Lot filters">
          {(
            [
              ['all', `All lots (${tabCounts.all})`],
              ['active', `Active (${tabCounts.active})`],
              ['expired', `Expired w/ qty (${tabCounts.expired})`],
              ['empty', `Empty (${tabCounts.empty})`],
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
                  <th>Product</th>
                  <th>Branch</th>
                  <th className="stocks-instock-col">On hand</th>
                  <th className="stocks-money-col">Cost</th>
                  <th className="stocks-money-col">Value</th>
                  <th className="whitespace-nowrap">{STOCK_SHORT.expiry}</th>
                  <th className="stocks-table-actions-col stocks-table-actions-col--pair" />
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-sm text-muted">
                      No batch lots match filters.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row) => {
                    const { batch, variant, value } = row
                    const empty = batch.qtyBase <= 0
                    return (
                      <tr
                        key={batch.id}
                        className={cn('catalog-table-row', empty && 'stocks-row--muted')}
                        onClick={() => setDetailRow(row)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setDetailRow(row)
                          }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`View lot ${batch.batchNo} for ${variant.productName}`}
                      >
                        <td>
                          <div className="stocks-product-cell">
                            <ShadeSwatch hex={variant.shadeHex} shadeName={variant.shadeName} />
                            <div className="stocks-product-text">
                              <p className="stocks-product-name">{variant.productName}</p>
                              <p className="stocks-product-meta">
                                Lot {batch.batchNo} · {variant.sku} · {variant.brand} · {variant.packLabel}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap">
                          <span className="stocks-branch-pill">
                            {branchLabelForWarehouse(shopId, batch.warehouseId)}
                          </span>
                        </td>
                        <td className="stocks-qty-cell stocks-instock-col">
                          <div className="stocks-qty-inner">
                            <p className="stocks-qty-remaining" title="On hand">
                              {qtyOnHandDisplay(batch.qtyBase, variant)} {STOCK_SHORT.remaining}
                            </p>
                            <p className="stocks-qty-purchased" title="Mfg date">
                              Mfg {formatInventoryDate(batch.mfgDate)}
                            </p>
                          </div>
                        </td>
                        <td className="stocks-money-col whitespace-nowrap text-sm tabular-nums">
                          {ratePerDisplayUnit(batch.costRatePerBase, variant)}
                        </td>
                        <td className="stocks-money-col whitespace-nowrap text-sm tabular-nums font-medium">
                          {formatInr(value)}
                        </td>
                        <td>
                          <div className="stocks-expiry-cell">
                            <ExpiryBadge
                              compact
                              expiryDate={batch.expiryDate}
                              className="stocks-expiry-badge"
                            />
                            <span className="stocks-expiry-date">{formatInventoryDate(batch.expiryDate)}</span>
                          </div>
                        </td>
                        <td className="stocks-table-actions-cell" onClick={(e) => e.stopPropagation()}>
                          <div className="stocks-table-actions">
                            <button
                              type="button"
                              className="stocks-action-btn"
                              onClick={() =>
                                setQtyFixTarget({ variantId: variant.id, batchId: batch.id })
                              }
                            >
                              Qty fix
                            </button>
                            <button
                              type="button"
                              className="stocks-action-btn"
                              disabled={empty}
                              onClick={() =>
                                setMoveTarget({ variantId: variant.id, batchId: batch.id })
                              }
                            >
                              Move
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          <footer className="stocks-pagination">
            <p className="stocks-pagination-meta">
              Showing <strong>{pageRows.length}</strong> of <strong>{lotRows.length}</strong> lots
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
                disabled={safePage <= 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-sm font-medium tabular-nums">
                Page {safePage} of {totalPages}
              </span>
              <button
                type="button"
                className="btn-secondary !h-9 !px-2.5"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </div>
      </section>

      <BatchLotDetailModal
        open={detailRow !== null}
        shopId={shopId}
        batch={detailRow?.batch ?? null}
        variant={detailRow?.variant ?? null}
        onClose={() => setDetailRow(null)}
      />

      {qtyFixTarget ? (
        <BatchQtyFixModal
          open
          variantId={qtyFixTarget.variantId}
          batchId={qtyFixTarget.batchId}
          onClose={() => setQtyFixTarget(null)}
        />
      ) : null}

      {moveTarget ? (
        <BatchBranchMoveModal
          open
          variantId={moveTarget.variantId}
          batchId={moveTarget.batchId}
          onClose={() => setMoveTarget(null)}
        />
      ) : null}
    </InventoryCatalogPageLayout>
  )
}