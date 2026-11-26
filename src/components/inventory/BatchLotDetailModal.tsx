import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock'
import { ExpiryBadge } from '@/components/inventory/ExpiryBadge'
import { ShadeSwatch } from '@/components/inventory/ShadeSwatch'
import { branchLabelForWarehouse } from '@/inventory/branch-warehouses'
import { qtyOnHandDisplay, ratePerDisplayUnit } from '@/inventory/display'
import { daysUntilExpiry } from '@/inventory/expiry'
import { formatInventoryDate } from '@/inventory/format-date'
import { formatInr } from '@/inventory/format-money'
import type { ProductVariant, StockBatch } from '@/inventory/types'

interface BatchLotDetailModalProps {
  open: boolean
  shopId: string
  batch: StockBatch | null
  variant: ProductVariant | null
  onClose: () => void
}

export function BatchLotDetailModal({ open, shopId, batch, variant, onClose }: BatchLotDetailModalProps) {
  useBodyScrollLock(open)

  if (!open || !batch || !variant) return null

  const lotValue = batch.qtyBase * batch.costRatePerBase
  const days = daysUntilExpiry(batch.expiryDate)
  const branch = branchLabelForWarehouse(shopId, batch.warehouseId)
  const qtyLabel = qtyOnHandDisplay(batch.qtyBase, variant)

  const expiryStat =
    days < 0 ? `Expired · ${Math.abs(days)}d ago` : days === 0 ? 'Expires today' : `${days}d left`

  const status =
    batch.qtyBase <= 0 ? 'empty' : days < 0 ? 'expired' : ('active' as const)

  const statusLabel =
    status === 'empty' ? 'Empty' : status === 'expired' ? 'Expired w/ qty' : 'Active'

  return (
    <div className="confirm-backdrop" role="presentation">
      <div
        className="support-dialog stock-form-dialog batch-lot-detail-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="batch-lot-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="stock-form-dialog-head">
          <div className="min-w-0">
            <p className="batch-lot-detail-eyebrow">Batch lot</p>
            <h2 id="batch-lot-detail-title" className="stock-form-dialog-title">
              Lot {batch.batchNo}
            </h2>
            <p className="stock-form-dialog-sub truncate">
              <span className="tabular-nums">{variant.sku}</span>
              <span aria-hidden> · </span>
              {variant.productName}
            </p>
          </div>
          <button type="button" className="stocks-trade-close" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="batch-lot-detail-product">
          <ShadeSwatch hex={variant.shadeHex} shadeName={variant.shadeName} />
          <div className="batch-lot-detail-product-text">
            <p className="batch-lot-detail-product-name">{variant.shadeName}</p>
            <p className="batch-lot-detail-product-meta">
              {variant.brand}
              <span aria-hidden> · </span>
              {variant.packLabel}
            </p>
          </div>
          <Link
            to={`/admin/inventory/variants/${variant.id}`}
            className="batch-lot-detail-sku-link"
            onClick={onClose}
          >
            Open SKU
          </Link>
        </div>

        <dl className="batch-lot-detail-stats">
          <div className="batch-lot-detail-stat">
            <dt>On hand</dt>
            <dd className="tabular-nums">{qtyLabel}</dd>
          </div>
          <div className="batch-lot-detail-stat">
            <dt>Lot value</dt>
            <dd className="tabular-nums">{formatInr(lotValue)}</dd>
          </div>
          <div className="batch-lot-detail-stat">
            <dt>Branch</dt>
            <dd>
              <span className="stocks-branch-pill">{branch}</span>
            </dd>
          </div>
          <div className="batch-lot-detail-stat">
            <dt>Expiry</dt>
            <dd className={days < 0 ? 'batch-lot-detail-stat--expired' : undefined}>{expiryStat}</dd>
          </div>
        </dl>

        <section className="stock-form-section batch-lot-detail-section">
          <h3 className="stock-form-section-title">Lot details</h3>
          <dl className="batch-lot-detail-grid">
            <div>
              <dt>Mfg date</dt>
              <dd>{formatInventoryDate(batch.mfgDate)}</dd>
            </div>
            <div>
              <dt>Expiry date</dt>
              <dd className="batch-lot-detail-expiry-row">
                <ExpiryBadge expiryDate={batch.expiryDate} className="stocks-expiry-badge" />
                <span className="stocks-expiry-date">{formatInventoryDate(batch.expiryDate)}</span>
              </dd>
            </div>
            <div>
              <dt>Cost rate</dt>
              <dd className="tabular-nums">{ratePerDisplayUnit(batch.costRatePerBase, variant)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span
                  className={
                    status === 'empty'
                      ? 'batch-lot-detail-pill batch-lot-detail-pill--muted'
                      : status === 'expired'
                        ? 'batch-lot-detail-pill batch-lot-detail-pill--warn'
                        : 'batch-lot-detail-pill batch-lot-detail-pill--ok'
                  }
                >
                  {statusLabel}
                </span>
              </dd>
            </div>
          </dl>
        </section>

        <footer className="catalog-skus-foot batch-lot-detail-foot">
          <button type="button" className="btn-primary !h-10 !min-w-[6.5rem]" onClick={onClose}>
            Done
          </button>
        </footer>
      </div>
    </div>
  )
}