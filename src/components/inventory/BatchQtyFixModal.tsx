import { useEffect, type FormEvent } from 'react'
import {
  BatchLotActionModal,
  StockFormCallout,
  StockFormField,
} from '@/components/inventory/BatchLotActionModal'
import { QuantityInput } from '@/components/inventory/QuantityInput'
import { StockFormProductCard } from '@/components/inventory/StockFormProductCard'
import { useStockAdjustment } from '@/hooks/inventory/use-stock-adjustment'
import type { DisplayUnit } from '@/inventory/types'
import { cn } from '@/lib/utils'

const REASONS = ['wastage', 'damage', 'expiry', 'correction', 'sample'] as const

const REASON_LABEL: Record<(typeof REASONS)[number], string> = {
  wastage: 'Wastage / spill',
  damage: 'Damaged goods',
  expiry: 'Expired write-off',
  correction: 'Count correction',
  sample: 'Sample / demo',
}

interface BatchQtyFixModalProps {
  open: boolean
  variantId: string
  batchId: string
  onClose: () => void
  onSuccess?: () => void
}

export function BatchQtyFixModal({ open, variantId, batchId, onClose, onSuccess }: BatchQtyFixModalProps) {
  const { form, setForm, errors, submitError, preview, variant, submit } = useStockAdjustment()

  useEffect(() => {
    if (!open) return
    setForm((prev) => ({
      ...prev,
      variantId,
      batchId,
      direction: 'decrease',
      reason: 'correction',
      qty: 1,
    }))
  }, [open, variantId, batchId, setForm])

  useEffect(() => {
    if (!open || !variant) return
    setForm((prev) => ({ ...prev, unit: variant.defaultDisplayUnit }))
  }, [open, variant, setForm])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const ok = submit()
    if (ok) {
      onSuccess?.()
      onClose()
    }
  }

  return (
    <BatchLotActionModal
      open={open}
      title="Qty fix"
      subtitle="Correct qty on this batch lot. Saved as an audit adjustment."
      ariaTitleId="batch-qty-fix-title"
      footerHint={preview ?? 'Changes post to movements and update this lot.'}
      submitLabel="Save qty fix"
      onClose={onClose}
      onSubmit={onSubmit}
    >
      {variant ? <StockFormProductCard variant={variant} badge="Batch lot" /> : null}

      <section className="stock-form-section">
        <h3 className="stock-form-section-title">Adjustment</h3>
        <div className="stock-form-section-stack">
        <StockFormField label="Direction">
          <div className="stock-form-segment" role="radiogroup" aria-label="Direction">
            {(['increase', 'decrease'] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                role="radio"
                aria-checked={form.direction === dir}
                className={cn(
                  'stock-form-segment-btn',
                  form.direction === dir && 'stock-form-segment-btn--on'
                )}
                onClick={() => setForm((prev) => ({ ...prev, direction: dir }))}
              >
                {dir === 'increase' ? 'Increase' : 'Decrease'}
              </button>
            ))}
          </div>
        </StockFormField>

        {variant ? (
          <QuantityInput
            variant="stock-form"
            qty={form.qty}
            unit={form.unit}
            kind={variant.baseKind}
            densityKgPerL={variant.densityKgPerL}
            onQtyChange={(qty) => setForm((prev) => ({ ...prev, qty }))}
            onUnitChange={(unit: DisplayUnit) => setForm((prev) => ({ ...prev, unit }))}
          />
        ) : null}
        {errors.qty ? <p className="stock-form-error">{errors.qty}</p> : null}
        </div>
      </section>

      <section className="stock-form-section">
        <h3 className="stock-form-section-title">Details</h3>
        <div className="stock-form-grid">
          {form.direction === 'decrease' ? (
            <StockFormField label="Reason" error={errors.reason}>
              <select
                className="stock-form-input"
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
                    {REASON_LABEL[r]}
                  </option>
                ))}
              </select>
            </StockFormField>
          ) : null}

          <StockFormField label="Effective date">
            <input
              type="date"
              className="stock-form-input"
              value={form.effectiveDate}
              onChange={(e) => setForm((prev) => ({ ...prev, effectiveDate: e.target.value }))}
            />
          </StockFormField>

          <StockFormField label="Note" full>
            <textarea
              className="stock-form-input stock-form-input--area"
              value={form.note ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
              rows={3}
              placeholder="Optional context for the audit trail"
            />
          </StockFormField>
        </div>
      </section>

      {submitError ? <StockFormCallout>{submitError}</StockFormCallout> : null}
    </BatchLotActionModal>
  )
}