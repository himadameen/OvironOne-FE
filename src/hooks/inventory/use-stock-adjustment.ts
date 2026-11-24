import { useState } from 'react'
import { convertFromBase, convertToBase, formatQty } from '@/inventory/units'
import { stockAdjustmentSchema, type StockAdjustmentInput } from '@/inventory/schemas'
import { useAuthStore } from '@/stores/auth-store'
import { useInventoryStore } from '@/stores/inventory-store'

const defaultForm: StockAdjustmentInput = {
  variantId: '',
  batchId: '',
  direction: 'decrease',
  qty: 1,
  unit: 'L',
  reason: undefined,
  note: '',
  effectiveDate: new Date().toISOString().slice(0, 10),
  allowNegativeOverride: false,
}

export function useStockAdjustment() {
  const shopId = useAuthStore((s) => s.shopId) ?? 'shop-ambur'
  const email = useAuthStore((s) => s.email) ?? 'admin@demo'
  const applyAdjustment = useInventoryStore((s) => s.applyAdjustment)
  const variants = useInventoryStore((s) => s.variants.filter((v) => v.shopId === shopId))
  const batches = useInventoryStore((s) => s.batches)

  const [form, setForm] = useState<StockAdjustmentInput>(defaultForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const variant = variants.find((v) => v.id === form.variantId)
  const batch = batches.find((b) => b.id === form.batchId)
  const variantBatches = batches.filter((b) => b.variantId === form.variantId)

  const preview =
    variant && batch && form.qty > 0
      ? (() => {
          try {
            const delta = convertToBase(
              form.qty,
              form.unit,
              variant.baseKind,
              variant.densityKgPerL
            )
            const signed = form.direction === 'increase' ? delta : -delta
            const nextBase = batch.qtyBase + signed
            const display = convertFromBase(
              Math.max(0, nextBase),
              form.unit,
              variant.baseKind,
              variant.densityKgPerL
            )
            return `Will become ${formatQty(display, form.unit)}`
          } catch {
            return 'Invalid unit for this variant.'
          }
        })()
      : null

  const submit = () => {
    setSubmitError(null)
    const parsed = stockAdjustmentSchema.safeParse(form)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? 'form'
        fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    if (!variant) {
      setSubmitError('Select a valid variant.')
      return
    }
    const result = applyAdjustment(shopId, email, parsed.data, variant.densityKgPerL, variant.baseKind)
    if (!result.ok) {
      setSubmitError(result.message)
      return
    }
    setForm({ ...defaultForm })
    return true
  }

  return {
    form,
    setForm,
    errors,
    submitError,
    preview,
    variants,
    variantBatches,
    variant,
    batch,
    submit,
  }
}