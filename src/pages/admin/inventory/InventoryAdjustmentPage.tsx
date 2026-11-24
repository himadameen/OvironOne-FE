import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PageShell } from '@/components/PageShell'
import { QuantityInput } from '@/components/inventory/QuantityInput'
import { useStockAdjustment } from '@/hooks/inventory/use-stock-adjustment'
import { InventoryPageHeader } from '@/pages/admin/inventory/InventoryModuleLayout'
import type { DisplayUnit } from '@/inventory/types'

const REASONS = ['wastage', 'damage', 'expiry', 'correction', 'sample', 'transfer'] as const

export function InventoryAdjustmentPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { form, setForm, errors, submitError, preview, variants, variantBatches, variant, submit } =
    useStockAdjustment()

  const onVariantChange = (variantId: string) => {
    const matched = variants.find((item) => item.id === variantId)
    setForm((prev) => ({
      ...prev,
      variantId,
      batchId: '',
      unit: matched?.defaultDisplayUnit ?? prev.unit,
    }))
  }

  useEffect(() => {
    const v = params.get('variant')
    if (!v) return
    const b = params.get('batch')
    const intent = params.get('intent')
    const matched = variants.find((item) => item.id === v)
    setForm((prev) => {
      const nextUnit = matched?.defaultDisplayUnit ?? prev.unit
      const nextReason = intent === 'transfer' ? 'transfer' : prev.reason
      const nextDirection = intent === 'transfer' ? 'decrease' : prev.direction
      const nextBatchId = b ?? prev.batchId
      if (
        prev.variantId === v &&
        prev.batchId === nextBatchId &&
        prev.reason === nextReason &&
        prev.direction === nextDirection &&
        prev.unit === nextUnit
      ) {
        return prev
      }
      return {
        ...prev,
        variantId: v,
        batchId: nextBatchId,
        reason: nextReason,
        direction: nextDirection,
        unit: nextUnit,
      }
    })
  }, [params, variants, setForm])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const ok = submit()
    if (ok) navigate('/admin/inventory/movements')
  }

  return (
    <PageShell
      title="Stock adjustment"
      description="Increase or decrease batch qty with unit toggle. Movements are append-only."
    >
      <InventoryPageHeader />

      <form onSubmit={onSubmit} className="card-widget max-w-2xl space-y-4">
        <label className="block space-y-1">
          <span className="text-small font-medium text-muted">Variant</span>
          <select
            className="input-field !h-10"
            value={form.variantId}
            onChange={(e) => onVariantChange(e.target.value)}
          >
            <option value="">Select variant…</option>
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.sku} — {v.productName} ({v.shadeName})
              </option>
            ))}
          </select>
          {errors.variantId ? <p className="text-sm text-brand-secondary">{errors.variantId}</p> : null}
        </label>

        <label className="block space-y-1">
          <span className="text-small font-medium text-muted">Batch</span>
          <select
            className="input-field !h-10"
            value={form.batchId}
            disabled={!form.variantId}
            onChange={(e) => setForm((prev) => ({ ...prev, batchId: e.target.value }))}
          >
            <option value="">Select batch…</option>
            {variantBatches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.batchNo} · exp {b.expiryDate}
              </option>
            ))}
          </select>
          {errors.batchId ? <p className="text-sm text-brand-secondary">{errors.batchId}</p> : null}
        </label>

        <fieldset className="space-y-2">
          <legend className="text-small font-medium text-muted">Direction</legend>
          <div className="flex gap-3">
            {(['increase', 'decrease'] as const).map((dir) => (
              <label key={dir} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="direction"
                  checked={form.direction === dir}
                  onChange={() => setForm((prev) => ({ ...prev, direction: dir }))}
                />
                {dir === 'increase' ? 'Increase' : 'Decrease'}
              </label>
            ))}
          </div>
        </fieldset>

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

        {form.direction === 'decrease' ? (
          <label className="block space-y-1">
            <span className="text-small font-medium text-muted">Reason</span>
            <select
              className="input-field !h-10"
              value={form.reason ?? ''}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  reason: e.target.value as (typeof REASONS)[number],
                }))
              }
            >
              <option value="">Select reason…</option>
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {errors.reason ? <p className="text-sm text-brand-secondary">{errors.reason}</p> : null}
          </label>
        ) : null}

        <label className="block space-y-1">
          <span className="text-small font-medium text-muted">Note</span>
          <textarea
            className="input-field min-h-[4rem] py-2"
            value={form.note ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
          />
        </label>

        <label className="block space-y-1">
          <span className="text-small font-medium text-muted">Effective date</span>
          <input
            type="date"
            className="input-field !h-10"
            value={form.effectiveDate}
            onChange={(e) => setForm((prev) => ({ ...prev, effectiveDate: e.target.value }))}
          />
        </label>

        {preview ? (
          <p className="rounded-lg border border-silver bg-table-header px-3 py-2 text-sm font-medium">
            Preview: {preview}
          </p>
        ) : null}

        {submitError ? (
          <p className="text-sm text-brand-secondary" role="alert">
            {submitError}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-2">
          <button type="submit" className="btn-primary">
            Save adjustment
          </button>
          <Link to="/admin/inventory" className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </PageShell>
  )
}