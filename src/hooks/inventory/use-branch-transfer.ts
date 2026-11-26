import { useMemo, useState } from 'react'
import { branchesForShop } from '@/data/mock-branches'
import { branchTransferSchema, type BranchTransferInput } from '@/inventory/schemas'
import { branchLabelForWarehouse } from '@/inventory/branch-warehouses'
import { convertFromBase, convertToBase, formatQty } from '@/inventory/units'
import { useAuthStore } from '@/stores/auth-store'
import { useInventoryStore } from '@/stores/inventory-store'
const defaultForm: BranchTransferInput = {
  toBranchId: '',
  variantId: '',
  batchId: '',
  qty: 1,
  unit: 'L',
  note: '',
  effectiveDate: new Date().toISOString().slice(0, 10),
}

export function useBranchTransfer(initial?: Partial<BranchTransferInput>) {
  const shopId = useAuthStore((s) => s.shopId) ?? 'shop-ambur'
  const email = useAuthStore((s) => s.email) ?? 'admin@demo'
  const recordBranchTransfer = useInventoryStore((s) => s.recordBranchTransfer)
  const allVariants = useInventoryStore((s) => s.variants)
  const batches = useInventoryStore((s) => s.batches)
  const movements = useInventoryStore((s) => s.movements)

  const variants = useMemo(
    () => allVariants.filter((v) => v.shopId === shopId),
    [allVariants, shopId]
  )

  const branches = useMemo(() => branchesForShop(shopId), [shopId])

  const recentTransfers = useMemo(
    () =>
      movements
        .filter(
          (m) =>
            m.shopId === shopId &&
            m.type === 'transfer' &&
            m.counterpartyWarehouseId &&
            m.reference.startsWith('BRT-')
        )
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, 12),
    [movements, shopId]
  )

  const [form, setForm] = useState<BranchTransferInput>({ ...defaultForm, ...initial })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [lastRef, setLastRef] = useState<string | null>(null)

  const variant = variants.find((v) => v.id === form.variantId)
  const batch = batches.find((b) => b.id === form.batchId)
  const variantBatches = batches.filter((b) => b.variantId === form.variantId && b.qtyBase > 0)

  const fromBranchLabel =
    batch && variant
      ? branchLabelForWarehouse(shopId, batch.warehouseId)
      : '—'

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
            const remaining = batch.qtyBase - delta
            const display = convertFromBase(
              Math.max(0, remaining),
              form.unit,
              variant.baseKind,
              variant.densityKgPerL
            )
            return `After move, this lot keeps ${formatQty(display, form.unit)} at the sending branch`
          } catch {
            return 'Invalid unit for this product.'
          }
        })()
      : null

  const submit = () => {
    setSubmitError(null)
    setLastRef(null)
    const parsed = branchTransferSchema.safeParse(form)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = issue.path[0]?.toString() ?? 'form'
        fieldErrors[key] = issue.message
      }
      setErrors(fieldErrors)
      return false
    }
    setErrors({})
    if (!variant) {
      setSubmitError('Select a valid product.')
      return false
    }
    const result = recordBranchTransfer(shopId, email, parsed.data)
    if (!result.ok) {
      setSubmitError(result.message)
      return false
    }
    setLastRef(result.reference)
    setForm((prev) => ({
      ...defaultForm,
      toBranchId: prev.toBranchId,
      effectiveDate: prev.effectiveDate,
    }))
    return true
  }

  return {
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
  }
}