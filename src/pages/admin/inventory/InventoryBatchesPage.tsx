import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '@/components/PageShell'
import { ColorSwatchChip } from '@/components/inventory/ColorSwatchChip'
import { ExpiryBadge } from '@/components/inventory/ExpiryBadge'
import { daysUntilExpiry } from '@/inventory/expiry'
import { formatInr } from '@/inventory/format-money'
import { convertFromBase, formatQty } from '@/inventory/units'
import { useAuthStore } from '@/stores/auth-store'
import { useInventoryStore } from '@/stores/inventory-store'
import { InventoryPageHeader } from '@/pages/admin/inventory/InventoryModuleLayout'

export function InventoryBatchesPage() {
  const shopId = useAuthStore((s) => s.shopId) ?? 'shop-ambur'
  const batches = useInventoryStore((s) => s.batches)
  const variants = useInventoryStore((s) => s.variants)
  const warehouses = useInventoryStore((s) => s.warehouses)

  const [variantId, setVariantId] = useState('all')
  const [warehouseId, setWarehouseId] = useState('all')
  const [status, setStatus] = useState<'all' | 'active' | 'expired' | 'empty'>('all')

  const shopVariants = variants.filter((v) => v.shopId === shopId)

  const rows = useMemo(() => {
    return batches
      .map((b) => {
        const variant = shopVariants.find((v) => v.id === b.variantId)
        if (!variant) return null
        const days = daysUntilExpiry(b.expiryDate)
        const value = b.qtyBase * b.costRatePerBase
        return { batch: b, variant, days, value }
      })
      .filter((row): row is NonNullable<typeof row> => !!row)
      .filter((row) => (variantId === 'all' ? true : row.variant.id === variantId))
      .filter((row) => (warehouseId === 'all' ? true : row.batch.warehouseId === warehouseId))
      .filter((row) => {
        if (status === 'empty') return row.batch.qtyBase <= 0
        if (status === 'expired') return row.days < 0 && row.batch.qtyBase > 0
        if (status === 'active') return row.batch.qtyBase > 0 && row.days >= 0
        return true
      })
      .sort((a, b) => a.batch.expiryDate.localeCompare(b.batch.expiryDate))
  }, [batches, shopVariants, variantId, warehouseId, status])

  return (
    <PageShell title="Batches" description="Batch-level truth for mfg, expiry, qty, and FIFO cost.">
      <InventoryPageHeader />

      <div className="card-widget space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <label className="space-y-1">
            <span className="text-small font-medium text-muted">Variant</span>
            <select className="input-field !h-10" value={variantId} onChange={(e) => setVariantId(e.target.value)}>
              <option value="all">All</option>
              {shopVariants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.sku} — {v.shadeName}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-small font-medium text-muted">Warehouse</span>
            <select className="input-field !h-10" value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
              <option value="all">All</option>
              {warehouses
                .filter((w) => w.shopId === shopId)
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-small font-medium text-muted">Status</span>
            <select className="input-field !h-10" value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="expired">Expired w/ qty</option>
              <option value="empty">Empty</option>
            </select>
          </label>
        </div>

        <div className="inv-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Batch</th>
                <th>Variant</th>
                <th>Mfg</th>
                <th>Expiry</th>
                <th>Days</th>
                <th>Qty</th>
                <th>Cost</th>
                <th>Value</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ batch, variant, days, value }) => {
                const qty = convertFromBase(
                  batch.qtyBase,
                  variant.defaultDisplayUnit,
                  variant.baseKind,
                  variant.densityKgPerL
                )
                const costDisplay =
                  variant.defaultDisplayUnit === 'L'
                    ? batch.costRatePerBase * 1000
                    : variant.defaultDisplayUnit === 'kg'
                      ? batch.costRatePerBase * 1000
                      : batch.costRatePerBase
                return (
                  <tr key={batch.id}>
                    <td>
                      <Link
                        to={`/admin/inventory/variants/${variant.id}`}
                        className="font-medium text-brand-primary hover:underline"
                      >
                        {batch.batchNo}
                      </Link>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <ColorSwatchChip hex={variant.shadeHex} />
                        <span className="text-sm">{variant.sku}</span>
                      </div>
                    </td>
                    <td>{batch.mfgDate}</td>
                    <td>
                      <ExpiryBadge expiryDate={batch.expiryDate} />
                    </td>
                    <td>{days}</td>
                    <td>{formatQty(qty, variant.defaultDisplayUnit)}</td>
                    <td>{formatInr(costDisplay)}</td>
                    <td>{formatInr(value)}</td>
                    <td className="text-sm text-muted">{batch.location}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  )
}