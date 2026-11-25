import { X } from 'lucide-react'
import type { ProductVariant } from '@/inventory/types'
import { ShadeSwatch } from '@/components/inventory/ShadeSwatch'

export interface CatalogSkuDialogMeta {
  label: string
  value: string
}

interface CatalogSkusDialogProps {
  open: boolean
  title: string
  subtitle?: string
  meta?: CatalogSkuDialogMeta[]
  skus: ProductVariant[]
  onClose: () => void
  onEditDetails?: () => void
  editLabel?: string
}

export function CatalogSkusDialog({
  open,
  title,
  subtitle,
  meta,
  skus,
  onClose,
  onEditDetails,
  editLabel = 'Edit details',
}: CatalogSkusDialogProps) {
  if (!open) return null

  return (
    <div className="confirm-backdrop" role="presentation" onClick={onClose}>
      <div
        className="support-dialog catalog-skus-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-skus-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="stock-form-dialog-head">
          <div>
            <h2 id="catalog-skus-title" className="stock-form-dialog-title">
              {title}
            </h2>
            {subtitle ? <p className="stock-form-dialog-sub">{subtitle}</p> : null}
          </div>
          <button type="button" className="stocks-trade-close" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>

        {meta && meta.length > 0 ? (
          <dl className="catalog-skus-meta">
            {meta.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="catalog-skus-table-wrap">
          <div className="inv-table-scroll stocks-table stocks-table-v2">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Pack</th>
                  <th>Branch</th>
                </tr>
              </thead>
              <tbody>
                {skus.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-sm text-muted">
                      No SKUs linked yet.
                    </td>
                  </tr>
                ) : (
                  skus.map((v) => (
                    <tr key={v.id}>
                      <td>
                        <div className="stocks-product-cell">
                          <ShadeSwatch hex={v.shadeHex} shadeName={v.shadeName} />
                          <div className="stocks-product-text">
                            <p className="stocks-product-name">{v.productName}</p>
                            <p className="stocks-product-meta">{v.shadeName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="tabular-nums text-sm">{v.sku}</td>
                      <td className="text-sm">{v.packLabel}</td>
                      <td className="text-sm text-muted">{v.warehouseName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="catalog-skus-foot">
          <button type="button" className="btn-secondary !h-10 px-5 text-sm" onClick={onClose}>
            Close
          </button>
          {onEditDetails ? (
            <button type="button" className="btn-primary !h-10 px-5 text-sm" onClick={onEditDetails}>
              {editLabel}
            </button>
          ) : null}
        </footer>
      </div>
    </div>
  )
}