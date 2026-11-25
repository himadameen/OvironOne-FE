import { useMemo, useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import type { InventoryCategory, ProductVariant } from '@/inventory/types'
import { CatalogActiveToggle } from '@/components/inventory/CatalogActiveToggle'
import { CategoryFormModal, type CategoryFormInput } from '@/components/inventory/CategoryFormModal'
import { CatalogSkusDialog } from '@/components/inventory/CatalogSkusDialog'
import { cn } from '@/lib/utils'

const KIND_LABEL: Record<InventoryCategory['kind'], string> = {
  paint: 'Paint',
  accessory: 'Accessory',
  consumable: 'Consumable',
}

interface CategoryCatalogPanelProps {
  categories: InventoryCategory[]
  variants: ProductVariant[]
  variantCounts: Record<string, number>
  onSave: (input: CategoryFormInput) => void
}

export function CategoryCatalogPanel({ categories, variants, variantCounts, onSave }: CategoryCatalogPanelProps) {
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<InventoryCategory | null>(null)
  const [skuViewCategory, setSkuViewCategory] = useState<InventoryCategory | null>(null)

  const visible = useMemo(
    () => categories.filter((c) => (statusFilter === 'active' ? c.active : !c.active)),
    [categories, statusFilter]
  )

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const openEdit = (c: InventoryCategory) => {
    setSkuViewCategory(null)
    setEditing(c)
    setFormOpen(true)
  }

  const openSkuList = (c: InventoryCategory) => {
    setSkuViewCategory(c)
  }

  const skuDialogSkus = skuViewCategory
    ? variants.filter((v) => v.categoryId === skuViewCategory.id)
    : []

  return (
    <>
      <section className="stocks-list-card card-widget !p-0">
        <div className="stocks-list-toolbar">
          <CatalogActiveToggle value={statusFilter} onChange={setStatusFilter} />
          <button type="button" className="btn-primary !ml-auto !h-10 px-4 text-sm" onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add category
          </button>
        </div>

        <div className="stocks-table-shell stocks-table-shell--flat stocks-table--comfortable">
          <div className="inv-table-scroll stocks-table stocks-table-v2">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th className="tabular-nums">Unit</th>
                  <th className="tabular-nums">SKUs</th>
                  <th>Status</th>
                  <th className="stocks-table-actions-col" />
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-sm text-muted">
                      No categories to show.
                    </td>
                  </tr>
                ) : (
                  visible.map((c) => {
                    const count = variantCounts[c.id] ?? 0
                    return (
                      <tr key={c.id} className={cn(!c.active && 'stocks-row--muted')}>
                        <td>
                          <button type="button" className="catalog-entity-link text-left" onClick={() => openSkuList(c)}>
                            <span className="block font-medium">{c.name}</span>
                            {c.description ? (
                              <span className="mt-0.5 block text-xs font-normal text-muted">{c.description}</span>
                            ) : null}
                          </button>
                        </td>
                        <td>{KIND_LABEL[c.kind]}</td>
                        <td className="tabular-nums">{c.defaultDisplayUnit}</td>
                        <td>
                          <button
                            type="button"
                            className="catalog-sku-count-link tabular-nums"
                            onClick={() => openSkuList(c)}
                            aria-label={`${count} SKUs in ${c.name}`}
                          >
                            {count}
                          </button>
                        </td>
                        <td>
                          <span className={cn('catalog-crud-status', c.active && 'catalog-crud-status--on')}>
                            {c.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="stocks-table-actions-cell">
                          <div className="stocks-table-actions">
                            <button
                              type="button"
                              className="stocks-icon-btn"
                              onClick={() => openEdit(c)}
                              aria-label={`Edit ${c.name}`}
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

      <CategoryFormModal
        open={formOpen}
        editing={editing}
        onClose={() => setFormOpen(false)}
        onSave={onSave}
      />

      <CatalogSkusDialog
        open={skuViewCategory !== null}
        title={skuViewCategory?.name ?? ''}
        subtitle={
          skuViewCategory
            ? `${KIND_LABEL[skuViewCategory.kind]} · default ${skuViewCategory.defaultDisplayUnit}`
            : undefined
        }
        meta={
          skuViewCategory?.description
            ? [{ label: 'Note', value: skuViewCategory.description }]
            : undefined
        }
        skus={skuDialogSkus}
        onClose={() => setSkuViewCategory(null)}
        onEditDetails={
          skuViewCategory
            ? () => {
                const cat = skuViewCategory
                setSkuViewCategory(null)
                openEdit(cat)
              }
            : undefined
        }
        editLabel="Edit category"
      />
    </>
  )
}