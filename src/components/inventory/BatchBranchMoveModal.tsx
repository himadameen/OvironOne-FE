import { useEffect, type FormEvent } from 'react'
import {
  BatchLotActionModal,
  StockFormCallout,
  StockFormField,
} from '@/components/inventory/BatchLotActionModal'
import { QuantityInput } from '@/components/inventory/QuantityInput'
import { StockFormProductCard } from '@/components/inventory/StockFormProductCard'
import { useBranchTransfer } from '@/hooks/inventory/use-branch-transfer'
import { warehouseForBranch } from '@/inventory/branch-warehouses'
import type { DisplayUnit } from '@/inventory/types'

interface BatchBranchMoveModalProps {
  open: boolean
  variantId: string
  batchId: string
  onClose: () => void
  onSuccess?: () => void
}

export function BatchBranchMoveModal({
  open,
  variantId,
  batchId,
  onClose,
  onSuccess,
}: BatchBranchMoveModalProps) {
  const {
    form,
    setForm,
    errors,
    submitError,
    lastRef,
    variant,
    preview,
    branches,
    batch,
    fromBranchLabel,
    submit,
  } = useBranchTransfer({ variantId, batchId })

  useEffect(() => {
    if (!open) return
    setForm((prev) => ({ ...prev, variantId, batchId }))
  }, [open, variantId, batchId, setForm])

  useEffect(() => {
    if (!open || !variant) return
    setForm((prev) => ({ ...prev, unit: variant.defaultDisplayUnit }))
  }, [open, variant, setForm])

  const availableDestBranches = batch
    ? branches.filter((br) => {
        const wh = warehouseForBranch(br.id)
        return wh && wh !== batch.warehouseId
      })
    : branches

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
      title="Branch move"
      subtitle={`Move qty from ${fromBranchLabel} to another branch.`}
      ariaTitleId="batch-branch-move-title"
      footerHint={preview ?? 'Both branches get linked movement records.'}
      submitLabel="Record move"
      onClose={onClose}
      onSubmit={onSubmit}
    >
      {variant ? <StockFormProductCard variant={variant} badge="Batch lot" /> : null}

      <section className="stock-form-section">
        <h3 className="stock-form-section-title">Transfer</h3>
        <div className="stock-form-section-stack">
        <div className="stock-form-grid">
          <StockFormField label="From branch">
            <input className="stock-form-input" readOnly value={fromBranchLabel} />
          </StockFormField>
          <StockFormField label="To branch" error={errors.toBranchId}>
            <select
              className="stock-form-input"
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
          </StockFormField>
        </div>

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
          <StockFormField label="Transfer date">
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
              placeholder="Optional — vehicle, person, or reference"
            />
          </StockFormField>
        </div>
      </section>

      {submitError ? <StockFormCallout>{submitError}</StockFormCallout> : null}
      {lastRef ? <p className="stock-form-success">Recorded as {lastRef}</p> : null}
    </BatchLotActionModal>
  )
}