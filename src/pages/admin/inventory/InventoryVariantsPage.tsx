import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Download, Pencil, Plus, Trash2 } from 'lucide-react'
import { InventorySectionGuide } from '@/components/inventory/InventorySectionGuide'
import { InventoryCatalogPageLayout } from '@/components/inventory/InventoryCatalogPageLayout'
import { ColorSwatchChip } from '@/components/inventory/ColorSwatchChip'
import { StockStatusBadge } from '@/components/inventory/StockStatusBadge'
import { downloadCsv } from '@/inventory/csv'
import { qtyOnHandDisplay, ratePerDisplayUnit } from '@/inventory/display'
import { formatInr } from '@/inventory/format-money'
import type { StockQuickFilter } from '@/inventory/types'
import { convertFromBase } from '@/inventory/units'
import { useInventoryVariants } from '@/hooks/inventory/use-inventory-variants'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { confirmDialog } from '@/stores/confirm-dialog-store'
import { useInventoryStore } from '@/stores/inventory-store'

export function InventoryVariantsPage() {
  const navigate = useNavigate()
  const shopId = useAuthStore((s) => s.shopId) ?? 'shop-ambur'
  const deleteStockEntry = useInventoryStore((s) => s.deleteStockEntry)
  const [params, setParams] = useSearchParams()
  const {
    search,
    setSearch,
    categoryId,
    setCategoryId,
    warehouseId,
    setWarehouseId,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    totalPages,
    rows,
    allRows,
    categories,
    warehouses,
  } = useInventoryVariants()

  useEffect(() => {
    const status = params.get('status') as StockQuickFilter | null
    if (!status) return
    const allowed: StockQuickFilter[] = ['all', 'low', 'expiring', 'expired', 'oos']
    if (allowed.includes(status)) {
      setStatusFilter((current) => (current === status ? current : status))
    }
  }, [params, setStatusFilter])

  const exportCsv = () => {
    downloadCsv(
      'inventory-variants.csv',
      ['SKU', 'Product', 'Shade', 'Category', 'Pack', 'Qty', 'FIFO value', 'Purchase', 'Selling', 'Status'],
      allRows.map((r) => [
        r.variant.sku,
        r.variant.productName,
        r.variant.shadeName,
        r.variant.categoryName,
        r.variant.packLabel,
        qtyOnHandDisplay(r.qtyBase, r.variant),
        formatInr(r.fifoValue),
        ratePerDisplayUnit(r.variant.purchaseCostPerBase, r.variant),
        ratePerDisplayUnit(r.variant.sellingCostPerBase, r.variant),
        r.health.join(', '),
      ])
    )
  }

  return (
    <InventoryCatalogPageLayout
      title="SKU list"
      description="One row per sellable product (SKU) — shade, pack, prices, and on-hand qty."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/inventory" className="btn-primary stocks-hero-btn inline-flex gap-2">
            <Plus className="h-4 w-4" />
            Add SKU
          </Link>
          <button type="button" className="btn-secondary stocks-hero-btn inline-flex gap-2" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      }
    >
      <InventorySectionGuide>
        Click a row to open SKU details. <strong>Add SKU</strong> uses Stocks → Add stock. Edit and delete use the icons
        on the right (row click won’t trigger those).
      </InventorySectionGuide>

      <section className="stocks-list-card card-widget space-y-4 p-4 md:p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-1">
            <span className="text-small font-medium text-muted">Search</span>
            <input
              className="input-field !h-10"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Product, SKU, brand, shade…"
            />
          </label>
          <label className="space-y-1">
            <span className="text-small font-medium text-muted">Category</span>
            <select
              className="input-field !h-10"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value)
                setPage(1)
              }}
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-small font-medium text-muted">Warehouse</span>
            <select
              className="input-field !h-10"
              value={warehouseId}
              onChange={(e) => {
                setWarehouseId(e.target.value)
                setPage(1)
              }}
            >
              <option value="all">All</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-small font-medium text-muted">Status</span>
            <select
              className="input-field !h-10"
              value={statusFilter}
              onChange={(e) => {
                const v = e.target.value as StockQuickFilter
                setStatusFilter(v)
                setParams(v === 'all' ? {} : { status: v })
                setPage(1)
              }}
            >
              <option value="all">All</option>
              <option value="low">Low</option>
              <option value="expiring">Expiring</option>
              <option value="expired">Expired</option>
              <option value="oos">Out of stock</option>
            </select>
          </label>
        </div>

        <div className="inv-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Shade</th>
                <th>Pack</th>
                <th>Qty</th>
                <th>Value (FIFO)</th>
                <th>Purchase</th>
                <th>Selling</th>
                <th>Reorder</th>
                <th>Status</th>
                <th className="stocks-table-actions-col" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const reorderDisplay = convertFromBase(
                  row.variant.reorderLevelBase,
                  row.variant.defaultDisplayUnit,
                  row.variant.baseKind,
                  row.variant.densityKgPerL
                )
                return (
                  <tr
                    key={row.variant.id}
                    className={cn('catalog-table-row')}
                    onClick={() => navigate(`/admin/inventory/variants/${row.variant.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        navigate(`/admin/inventory/variants/${row.variant.id}`)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View ${row.variant.productName}`}
                  >
                    <td>
                      <span className="font-medium">{row.variant.productName}</span>
                      <span className="block text-xs text-muted">
                        {row.variant.brand} · {row.variant.categoryName}
                      </span>
                    </td>
                    <td>
                      <ColorSwatchChip hex={row.variant.shadeHex} label={row.variant.shadeName} />
                    </td>
                    <td>{row.variant.packLabel}</td>
                    <td className="font-medium">{qtyOnHandDisplay(row.qtyBase, row.variant)}</td>
                    <td>{formatInr(row.fifoValue)}</td>
                    <td className="text-sm">
                      {ratePerDisplayUnit(row.variant.purchaseCostPerBase, row.variant)}
                    </td>
                    <td className="text-sm">
                      {ratePerDisplayUnit(row.variant.sellingCostPerBase, row.variant)}
                    </td>
                    <td className="text-sm text-muted">
                      {reorderDisplay.toFixed(row.variant.baseKind === 'count' ? 0 : 1)}{' '}
                      {row.variant.defaultDisplayUnit}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {row.health.map((h) => (
                          <StockStatusBadge key={h} status={h} />
                        ))}
                      </div>
                    </td>
                    <td className="stocks-table-actions-cell" onClick={(e) => e.stopPropagation()}>
                      <div className="stocks-table-actions">
                        <button
                          type="button"
                          className="stocks-icon-btn"
                          aria-label={`Edit ${row.variant.productName}`}
                          onClick={() => navigate(`/admin/inventory?edit=${row.variant.id}`)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="stocks-icon-btn stocks-icon-btn--danger"
                          aria-label={`Delete ${row.variant.productName}`}
                          onClick={() => {
                            void confirmDialog({
                              title: 'Delete SKU?',
                              message: `Remove ${row.variant.productName} and all its batch lots?`,
                              variant: 'danger',
                              confirmLabel: 'Delete',
                            }).then((ok) => {
                              if (ok) deleteStockEntry(shopId, row.variant.id)
                            })
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="inv-mobile-cards">
          {rows.map((row) => (
            <article key={row.variant.id} className="inv-mobile-card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{row.variant.productName}</p>
                  <p className="text-xs text-muted">{row.variant.sku}</p>
                </div>
                <ColorSwatchChip hex={row.variant.shadeHex} label={row.variant.shadeName} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-muted">Qty</dt>
                  <dd className="font-medium">{qtyOnHandDisplay(row.qtyBase, row.variant)}</dd>
                </div>
                <div>
                  <dt className="text-muted">FIFO</dt>
                  <dd>{formatInr(row.fifoValue)}</dd>
                </div>
              </dl>
              <button
                type="button"
                className="btn-secondary mt-3 w-full text-center text-sm"
                onClick={() => navigate(`/admin/inventory/variants/${row.variant.id}`)}
              >
                Open SKU
              </button>
            </article>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted">
            Page {page} of {totalPages} · {allRows.length} variants
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary !h-9 px-3 text-sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn-secondary !h-9 px-3 text-sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </InventoryCatalogPageLayout>
  )
}