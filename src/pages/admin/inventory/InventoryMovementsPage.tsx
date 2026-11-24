import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { PageShell } from '@/components/PageShell'
import { ColorSwatchChip } from '@/components/inventory/ColorSwatchChip'
import { MovementTypePill } from '@/components/inventory/MovementTypePill'
import { downloadCsv } from '@/inventory/csv'
import { formatInr } from '@/inventory/format-money'
import type { MovementType } from '@/inventory/types'
import { convertFromBase, formatQty } from '@/inventory/units'
import { useAuthStore } from '@/stores/auth-store'
import { useInventoryStore } from '@/stores/inventory-store'
import { InventoryPageHeader } from '@/pages/admin/inventory/InventoryModuleLayout'

export function InventoryMovementsPage() {
  const shopId = useAuthStore((s) => s.shopId) ?? 'shop-ambur'
  const movements = useInventoryStore((s) => s.movements)
  const variants = useInventoryStore((s) => s.variants.filter((v) => v.shopId === shopId))

  const [from, setFrom] = useState('2025-11-01')
  const [to, setTo] = useState('2025-11-30')
  const [type, setType] = useState<'all' | MovementType>('all')
  const [variantId, setVariantId] = useState('all')
  const [drawerId, setDrawerId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return movements
      .filter((m) => m.shopId === shopId)
      .filter((m) => {
        const d = m.at.slice(0, 10)
        return d >= from && d <= to
      })
      .filter((m) => (type === 'all' ? true : m.type === type))
      .filter((m) => (variantId === 'all' ? true : m.variantId === variantId))
      .sort((a, b) => b.at.localeCompare(a.at))
  }, [movements, shopId, from, to, type, variantId])

  const selected = filtered.find((m) => m.id === drawerId)

  const exportCsv = () => {
    downloadCsv(
      'stock-movements.csv',
      ['Date', 'Type', 'Variant', 'Qty', 'Cost', 'Ref', 'User', 'Note'],
      filtered.map((m) => {
        const variant = variants.find((v) => v.id === m.variantId)
        const qty =
          variant &&
          formatQty(
            convertFromBase(Math.abs(m.qtyDeltaBase), variant.defaultDisplayUnit, variant.baseKind, variant.densityKgPerL),
            variant.defaultDisplayUnit
          )
        return [
          m.at,
          m.type,
          variant?.sku ?? m.variantId,
          variant ? `${m.qtyDeltaBase >= 0 ? '+' : '-'}${qty}` : String(m.qtyDeltaBase),
          m.costRatePerBase != null ? formatInr(m.costRatePerBase) : '',
          m.reference,
          m.userEmail,
          m.note ?? '',
        ]
      })
    )
  }

  return (
    <PageShell
      title="Movements"
      description="Read-only stock ledger — adjustments, purchases, transfers, and sales."
      actions={
        <button type="button" className="btn-secondary inline-flex gap-2" onClick={exportCsv}>
          <Download className="h-4 w-4" />
          CSV
        </button>
      }
    >
      <InventoryPageHeader />

      <div className="card-widget space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <label className="space-y-1">
            <span className="text-small font-medium text-muted">From</span>
            <input type="date" className="input-field !h-10" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-small font-medium text-muted">To</span>
            <input type="date" className="input-field !h-10" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className="text-small font-medium text-muted">Type</span>
            <select className="input-field !h-10" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
              <option value="all">All</option>
              <option value="purchase">Purchase</option>
              <option value="adjustment">Adjustment</option>
              <option value="transfer">Transfer</option>
              <option value="sale">Sale</option>
            </select>
          </label>
          <label className="space-y-1 xl:col-span-2">
            <span className="text-small font-medium text-muted">Variant</span>
            <select className="input-field !h-10" value={variantId} onChange={(e) => setVariantId(e.target.value)}>
              <option value="all">All</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.sku}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="inv-table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Variant</th>
                <th>Qty</th>
                <th>Ref</th>
                <th>User</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const variant = variants.find((v) => v.id === m.variantId)
                if (!variant) return null
                const d = convertFromBase(
                  Math.abs(m.qtyDeltaBase),
                  variant.defaultDisplayUnit,
                  variant.baseKind,
                  variant.densityKgPerL
                )
                return (
                  <tr key={m.id}>
                    <td>{new Date(m.at).toLocaleString('en-IN')}</td>
                    <td>
                      <MovementTypePill type={m.type} />
                    </td>
                    <td>
                      <ColorSwatchChip hex={variant.shadeHex} label={variant.sku} />
                    </td>
                    <td className="font-medium">
                      {m.qtyDeltaBase >= 0 ? '+' : '−'}
                      {formatQty(d, variant.defaultDisplayUnit)}
                    </td>
                    <td>{m.reference}</td>
                    <td className="text-sm text-muted">{m.userEmail}</td>
                    <td>
                      <button
                        type="button"
                        className="text-sm text-brand-primary hover:underline"
                        onClick={() => setDrawerId(m.id)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selected ? (
        <div className="confirm-backdrop" role="presentation" onClick={() => setDrawerId(null)}>
          <div
            className="support-dialog max-w-md"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="confirm-dialog-title">Movement detail</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div>
                <dt className="text-muted">Reference</dt>
                <dd className="font-medium">{selected.reference}</dd>
              </div>
              <div>
                <dt className="text-muted">Note</dt>
                <dd>{selected.note ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted">Reason</dt>
                <dd>{selected.reason ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-muted">Warehouse</dt>
                <dd>{selected.warehouseId}</dd>
              </div>
            </dl>
            <div className="confirm-dialog-actions">
              <button type="button" className="btn-primary !h-10 px-4 text-sm" onClick={() => setDrawerId(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  )
}