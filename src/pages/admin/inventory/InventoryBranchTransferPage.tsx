import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { QuantityInput } from '@/components/inventory/QuantityInput'
import { InventoryCatalogPageLayout } from '@/components/inventory/InventoryCatalogPageLayout'
import { InventorySectionGuide } from '@/components/inventory/InventorySectionGuide'
import { MovementTypePill } from '@/components/inventory/MovementTypePill'
import { useBranchTransfer } from '@/hooks/inventory/use-branch-transfer'
import { branchLabelForWarehouse, warehouseForBranch } from '@/inventory/branch-warehouses'
import { formatInventoryDate } from '@/inventory/format-date'
import { convertFromBase, formatQty } from '@/inventory/units'
import type { DisplayUnit } from '@/inventory/types'

export function InventoryBranchTransferPage() {
  const [params] = useSearchParams()
  const {
    shopId,
    form,
    setForm,
    errors,
    submitError,
    lastRef,
    variant,
    variantBatches,
    batch,
    preview,
    branches,
    variants,
    recentTransfers,
    allVariants,
    fromBranchLabel,
    submit,
  } = useBranchTransfer({
    variantId: params.get('variant') ?? '',
    batchId: params.get('batch') ?? '',
  })

  useEffect(() => {
    const v = params.get('variant')
    const b = params.get('batch')
    if (!v && !b) return
    setForm((prev) => ({
      ...prev,
      variantId: v ?? prev.variantId,
      batchId: b ?? prev.batchId,
    }))
  }, [params, setForm])

  const onVariantChange = (variantId: string) => {
    const matched = variants.find((item) => item.id === variantId)
    setForm((prev) => ({
      ...prev,
      variantId,
      batchId: '',
      unit: matched?.defaultDisplayUnit ?? prev.unit,
    }))
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submit()
  }

  const availableDestBranches = batch
    ? branches.filter((br) => {
        const wh = warehouseForBranch(br.id)
        return wh && wh !== batch.warehouseId
      })
    : branches

  return (
    <InventoryCatalogPageLayout
      title="Branch transfer"
      description="Move stock between your branches (e.g. Main street → Yard). Same shop — qty leaves one branch and appears at the other."
    >
      <InventorySectionGuide>
        Use this when physical stock moves between locations. It does <strong>not</strong> change price — only
        which branch holds the batch. New lots are still added from <strong>Stocks → Add stock</strong>.
      </InventorySectionGuide>

      <form onSubmit={onSubmit} className="stocks-list-card card-widget max-w-2xl space-y-4 p-4 md:p-5">
        <label className="block space-y-1">
          <span className="text-small font-medium text-muted">From branch</span>
          <input className="input-field !h-10" readOnly value={fromBranchLabel} />
          <span className="text-xs text-muted">Taken from the batch you select below</span>
        </label>

        <label className="block space-y-1">
          <span className="text-small font-medium text-muted">To branch</span>
          <select
            className="input-field !h-10"
            value={form.toBranchId}
            onChange={(e) => setForm((prev) => ({ ...prev, toBranchId: e.target.value }))}
          >
            <option value="">Select branch…</option>
            {availableDestBranches.map((br) => (
              <option key={br.id} value={br.id}>
                {br.name}
              </option>
            ))}
          </select>
          {errors.toBranchId ? <p className="text-sm text-brand-secondary">{errors.toBranchId}</p> : null}
        </label>

        <label className="block space-y-1">
          <span className="text-small font-medium text-muted">Product (SKU)</span>
          <select
            className="input-field !h-10"
            value={form.variantId}
            onChange={(e) => onVariantChange(e.target.value)}
          >
            <option value="">Select product…</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.sku} — {v.productName}
              </option>
            ))}
          </select>
          {errors.variantId ? <p className="text-sm text-brand-secondary">{errors.variantId}</p> : null}
        </label>

        <label className="block space-y-1">
          <span className="text-small font-medium text-muted">Batch lot</span>
          <select
            className="input-field !h-10"
            value={form.batchId}
            disabled={!form.variantId}
            onChange={(e) => setForm((prev) => ({ ...prev, batchId: e.target.value }))}
          >
            <option value="">Select lot…</option>
            {variantBatches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batchNo} · {branchLabelForWarehouse(shopId, b.warehouseId)} · exp {b.expiryDate}
              </option>
            ))}
          </select>
          {errors.batchId ? <p className="text-sm text-brand-secondary">{errors.batchId}</p> : null}
        </label>

        {variant ? (
          <QuantityInput
            qty={form.qty}
            unit={form.unit}
            kind={variant.baseKind}
            densityKgPerL={variant.densityKgPerL}
            onQtyChange={(qty) => setForm((prev) => ({ ...prev, qty }))}
            onUnitChange={(unit: DisplayUnit) => setForm((prev) => ({ ...prev, unit }))}
          />
        ) : null}
        {errors.qty ? <p className="text-sm text-brand-secondary">{errors.qty}</p> : null}

        <label className="block space-y-1">
          <span className="text-small font-medium text-muted">Note (optional)</span>
          <textarea
            className="input-field min-h-[4rem] py-2"
            value={form.note ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
            placeholder="Van load, project site, etc."
          />
        </label>

        <label className="block space-y-1">
          <span className="text-small font-medium text-muted">Transfer date</span>
          <input
            type="date"
            className="input-field !h-10"
            value={form.effectiveDate}
            onChange={(e) => setForm((prev) => ({ ...prev, effectiveDate: e.target.value }))}
          />
        </label>

        {preview ? (
          <p className="rounded-lg border border-silver bg-table-header px-3 py-2 text-sm font-medium">
            {preview}
          </p>
        ) : null}

        {submitError ? (
          <p className="text-sm text-brand-secondary" role="alert">
            {submitError}
          </p>
        ) : null}

        {lastRef ? (
          <p className="text-sm font-medium text-[#1f6b47]" role="status">
            Saved as {lastRef} — ledger updated at both branches.
          </p>
        ) : null}

        <button type="submit" className="btn-primary">
          Record branch transfer
        </button>
      </form>

      <section className="stocks-list-card card-widget !p-0">
        <div className="border-b border-silver px-4 py-3">
          <h2 className="text-sm font-semibold text-charcoal">Recent branch transfers</h2>
        </div>
        <div className="inv-table-scroll stocks-table stocks-table-v2">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Ref</th>
                <th>SKU</th>
                <th>Type</th>
                <th>Branch flow</th>
                <th className="tabular-nums">Qty</th>
              </tr>
            </thead>
            <tbody>
              {recentTransfers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-sm text-muted">
                    No branch transfers yet.
                  </td>
                </tr>
              ) : (
                recentTransfers.map((m) => {
                  const v = allVariants.find((x) => x.id === m.variantId)
                  const qty = v
                    ? formatQty(
                        convertFromBase(
                          Math.abs(m.qtyDeltaBase),
                          v.defaultDisplayUnit,
                          v.baseKind,
                          v.densityKgPerL
                        ),
                        v.defaultDisplayUnit
                      )
                    : String(Math.abs(m.qtyDeltaBase))
                  const from = branchLabelForWarehouse(shopId, m.warehouseId)
                  const to = m.counterpartyWarehouseId
                    ? branchLabelForWarehouse(shopId, m.counterpartyWarehouseId)
                    : '—'
                  const flow =
                    m.qtyDeltaBase < 0 ? `${from} → ${to}` : `${to} → ${from}`
                  return (
                    <tr key={m.id}>
                      <td className="whitespace-nowrap text-sm">
                        {formatInventoryDate(m.at.slice(0, 10))}
                      </td>
                      <td className="font-medium">{m.reference}</td>
                      <td className="text-sm">{v?.sku ?? m.variantId}</td>
                      <td>
                        <MovementTypePill type={m.type} />
                      </td>
                      <td className="text-sm">{flow}</td>
                      <td className="tabular-nums text-sm">
                        {m.qtyDeltaBase >= 0 ? '+' : '−'}
                        {qty}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </InventoryCatalogPageLayout>
  )
}