import { Link, useParams } from 'react-router-dom'
import { PageShell } from '@/components/PageShell'
import { ColorSwatchChip } from '@/components/inventory/ColorSwatchChip'
import { ExpiryBadge } from '@/components/inventory/ExpiryBadge'
import { MovementTypePill } from '@/components/inventory/MovementTypePill'
import { StockStatusBadge } from '@/components/inventory/StockStatusBadge'
import { qtyOnHandDisplay, ratePerDisplayUnit } from '@/inventory/display'
import { formatInr, formatPercent } from '@/inventory/format-money'
import { convertFromBase, formatQty } from '@/inventory/units'
import { useInventoryVariant } from '@/hooks/inventory/use-inventory-variant'
import { InventoryPageHeader } from '@/pages/admin/inventory/InventoryModuleLayout'

export function InventoryVariantDetailPage() {
  const { variantId } = useParams()
  const detail = useInventoryVariant(variantId)

  if (!detail) {
    return (
      <PageShell title="Variant not found" description="This SKU is not in the demo inventory seed.">
        <InventoryPageHeader />
        <Link to="/admin/inventory/variants" className="text-brand-primary hover:underline">
          Back to variants
        </Link>
      </PageShell>
    )
  }

  const { variant, batches, qtyBase, fifoValue, avgCost, margin, ledger, health } = detail

  return (
    <PageShell
      title={variant.productName}
      description={`${variant.brand} · ${variant.categoryName} · pack ${variant.packLabel}`}
      actions={
        <div className="flex flex-wrap gap-2">
          <Link
            to={`/admin/inventory/adjustments/new?variant=${variant.id}`}
            className="btn-primary"
          >
            Adjust
          </Link>
          <Link
            to={`/admin/inventory/adjustments/new?variant=${variant.id}&intent=transfer`}
            className="btn-secondary"
          >
            Transfer
          </Link>
        </div>
      }
    >
      <InventoryPageHeader />

      <header className="card-widget flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <ColorSwatchChip hex={variant.shadeHex} label={variant.shadeName} />
          <dl className="mt-3 grid gap-1 text-sm">
            <div>
              <span className="text-muted">SKU </span>
              <span className="font-medium">{variant.sku}</span>
            </div>
            <div>
              <span className="text-muted">Barcode </span>
              <span>{variant.barcode}</span>
            </div>
            <div>
              <span className="text-muted">Reorder </span>
              <span>
                {convertFromBase(
                  variant.reorderLevelBase,
                  variant.defaultDisplayUnit,
                  variant.baseKind,
                  variant.densityKgPerL
                ).toFixed(variant.baseKind === 'count' ? 0 : 1)}{' '}
                {variant.defaultDisplayUnit}
              </span>
            </div>
          </dl>
        </div>
        <div className="flex flex-wrap gap-1">
          {health.map((h) => (
            <StockStatusBadge key={h} status={h} />
          ))}
        </div>
      </header>

      <section className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <article className="card-widget">
          <p className="text-xs font-medium uppercase text-muted">Qty on hand</p>
          <p className="stat-value mt-1">{qtyOnHandDisplay(qtyBase, variant)}</p>
        </article>
        <article className="card-widget">
          <p className="text-xs font-medium uppercase text-muted">FIFO value</p>
          <p className="stat-value mt-1">{formatInr(fifoValue)}</p>
        </article>
        <article className="card-widget">
          <p className="text-xs font-medium uppercase text-muted">Avg cost</p>
          <p className="stat-value mt-1">{ratePerDisplayUnit(avgCost, variant)}</p>
        </article>
        <article className="card-widget">
          <p className="text-xs font-medium uppercase text-muted">Selling rate</p>
          <p className="stat-value mt-1">
            {ratePerDisplayUnit(variant.sellingCostPerBase, variant)}
          </p>
        </article>
        <article className="card-widget">
          <p className="text-xs font-medium uppercase text-muted">Margin</p>
          <p className="stat-value mt-1">{formatPercent(margin)}</p>
          <p className="text-xs text-muted">
            Purchase {ratePerDisplayUnit(variant.purchaseCostPerBase, variant)}
          </p>
        </article>
      </section>

      <section className="card-widget mt-6">
        <h2 className="text-h2">Batches</h2>
        <div className="inv-table-scroll mt-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Mfg</th>
                <th>Expiry</th>
                <th>Qty</th>
                <th>Cost</th>
                <th>Location</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => {
                const qty = convertFromBase(
                  b.qtyBase,
                  variant.defaultDisplayUnit,
                  variant.baseKind,
                  variant.densityKgPerL
                )
                return (
                  <tr key={b.id}>
                    <td className="font-medium">{b.batchNo}</td>
                    <td>{b.mfgDate}</td>
                    <td>
                      <ExpiryBadge expiryDate={b.expiryDate} />
                    </td>
                    <td>{formatQty(qty, variant.defaultDisplayUnit)}</td>
                    <td>{ratePerDisplayUnit(b.costRatePerBase, variant)}</td>
                    <td className="text-sm text-muted">{b.location}</td>
                    <td>
                      {b.qtyBase <= 0 ? (
                        <StockStatusBadge status="oos" />
                      ) : (
                        <ExpiryBadge expiryDate={b.expiryDate} />
                      )}
                    </td>
                    <td className="space-x-2 whitespace-nowrap">
                      <Link
                        to={`/admin/inventory/adjustments/new?variant=${variant.id}&batch=${b.id}`}
                        className="text-sm text-brand-primary hover:underline"
                      >
                        Adjust
                      </Link>
                      <Link
                        to={`/admin/inventory/adjustments/new?variant=${variant.id}&batch=${b.id}&intent=transfer`}
                        className="text-sm text-muted hover:underline"
                      >
                        Transfer
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-widget mt-6">
        <h2 className="text-h2">Movements ledger</h2>
        <p className="text-xs text-muted">Append-only — demo store keeps full history.</p>
        <div className="inv-table-scroll mt-4">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Ref</th>
                <th>User</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((m) => {
                const d = convertFromBase(
                  Math.abs(m.qtyDeltaBase),
                  variant.defaultDisplayUnit,
                  variant.baseKind,
                  variant.densityKgPerL
                )
                const sign = m.qtyDeltaBase >= 0 ? '+' : '−'
                return (
                  <tr key={m.id}>
                    <td>{new Date(m.at).toLocaleString('en-IN')}</td>
                    <td>
                      <MovementTypePill type={m.type} />
                    </td>
                    <td className="font-medium">
                      {sign}
                      {formatQty(d, variant.defaultDisplayUnit)}
                    </td>
                    <td>{m.reference}</td>
                    <td className="text-sm text-muted">{m.userEmail}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </PageShell>
  )
}