import { z } from 'zod'
import type { DisplayUnit } from '@/inventory/types'

const displayUnitSchema = z.enum(['L', 'ml', 'kg', 'g', 'nos'])

export const stockAdjustmentSchema = z
  .object({
    variantId: z.string().min(1, 'Select a variant.'),
    batchId: z.string().min(1, 'Select a batch.'),
    direction: z.enum(['increase', 'decrease']),
    qty: z.coerce.number().positive('Quantity must be greater than zero.'),
    unit: displayUnitSchema,
    reason: z.enum(['wastage', 'damage', 'expiry', 'correction', 'sample', 'transfer']).optional(),
    note: z.string().max(500).optional(),
    effectiveDate: z.string().min(1, 'Date is required.'),
    allowNegativeOverride: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.direction === 'decrease' && !data.reason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Reason is required when decreasing stock.',
        path: ['reason'],
      })
    }
  })

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>

export function parseDisplayUnit(value: string): DisplayUnit {
  return displayUnitSchema.parse(value)
}