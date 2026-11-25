import { useMemo, useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import type { BrandFormInput, InventoryBrand, ProductVariant } from '@/inventory/types'
import { BrandFormModal } from '@/components/inventory/BrandFormModal'
import { CatalogActiveToggle } from '@/components/inventory/CatalogActiveToggle'
import { CatalogSkusDialog } from '@/components/inventory/CatalogSkusDialog'
import { cn } from '@/lib/utils'

interface BrandCatalogPanelProps {
  brands: InventoryBrand[]
  variants: ProductVariant[]
  skuCounts: Record<string, number>
  onSave: (input: BrandFormInput) => void
}

function brandMeta(b: InventoryBrand) {
  const rows: { label: string; value: string }[] = []
  if (b.pocName) rows.push({ label: 'POC', value: b.pocName })
  if (b.pocPhone) rows.push({ label: 'Phone', value: b.pocPhone })
  if (b.dealerNumber) rows.push({ label: 'Dealer no.', value: b.dealerNumber })
  if (b.dealerEmail) rows.push({ label: 'Email', value: b.dealerEmail })
  return rows
}

function variantsForBrand(brand: InventoryBrand, variants: ProductVariant[]) {
  return variants.filter((v) => v.brandId === brand.id || v.brand === brand.name)
}

export function BrandCatalogPanel({ brands, variants, skuCounts, onSave }: BrandCatalogPanelProps) {
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<InventoryBrand | null>(null)
  const [skuViewBrand, setSkuViewBrand] = useState<InventoryBrand | null>(null)

  const visible = useMemo(
    () => brands.filter((b) => (statusFilter === 'active' ? b.active : !b.active)),
    [brands, statusFilter]
  )

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (b: InventoryBrand) => {
    setSkuViewBrand(null)
    setEditing(b)
    setFormOpen(true)
  }

  const openSkuList = (b: InventoryBrand) => {
    setSkuViewBrand(b)
  }

  const skuDialogSkus = skuViewBrand ? variantsForBrand(skuViewBrand, variants) : []

  return (
    <>
      <section className="stocks-list-card card-widget !p-0">
        <div className="stocks-list-toolbar">
          <CatalogActiveToggle value={statusFilter} onChange={setStatusFilter} />
          <button type="button" className="btn-primary !ml-auto !h-10 px-4 text-sm" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add brand
          </button>
        </div>

        <div className="stocks-table-shell stocks-table-shell--flat stocks-table--comfortable">
          <div className="inv-table-scroll stocks-table stocks-table-v2">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>POC</th>
                  <th>Dealer no.</th>
                  <th className="tabular-nums">SKUs</th>
                  <th>Status</th>
                  <th className="stocks-table-actions-col" />
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-sm text-muted">
                      No brands to show.
                    </td>
                  </tr>
                ) : (
                  visible.map((b) => {
                    const count = skuCounts[b.id] ?? 0
                    return (
                      <tr key={b.id} className={cn(!b.active && 'stocks-row--muted')}>
                        <td>
                          <button
                            type="button"
                            className="catalog-entity-link"
                            onClick={() => openSkuList(b)}
                          >
                            {b.name}
                          </button>
                        </td>
                        <td className="text-sm text-muted">{b.pocName ?? '—'}</td>
                        <td className="text-sm tabular-nums">{b.dealerNumber ?? '—'}</td>
                        <td>
                          <button
                            type="button"
                            className="catalog-sku-count-link tabular-nums"
                            onClick={() => openSkuList(b)}
                            aria-label={`${count} SKUs for ${b.name}`}
                          >
                            {count}
                          </button>
                        </td>
                        <td>
                          <span className={cn('catalog-crud-status', b.active && 'catalog-crud-status--on')}>
                            {b.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="stocks-table-actions-cell">
                          <div className="stocks-table-actions">
                            <button
                              type="button"
                              className="stocks-icon-btn"
                              onClick={() => openEdit(b)}
                              aria-label={`Edit ${b.name}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
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
        </div>
      </section>

      <BrandFormModal
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSave={onSave}
      />

      <CatalogSkusDialog
        open={skuViewBrand !== null}
        title={skuViewBrand?.name ?? ''}
        subtitle={
          skuViewBrand
            ? `${skuDialogSkus.length} SKU${skuDialogSkus.length === 1 ? '' : 's'} on this brand`
            : undefined
        }
        meta={skuViewBrand ? brandMeta(skuViewBrand) : undefined}
        skus={skuDialogSkus}
        onClose={() => setSkuViewBrand(null)}
        onEditDetails={
          skuViewBrand
            ? () => {
                const b = skuViewBrand
                setSkuViewBrand(null)
                openEdit(b)
              }
            : undefined
        }
        editLabel="Edit brand"
      />
    </>
  )
}