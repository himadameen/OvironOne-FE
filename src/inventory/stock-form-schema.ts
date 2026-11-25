import { z } from 'zod'
import type { InventoryCategoryKind } from '@/inventory/types'

const baseStockForm = z.object({
  /** Pick existing catalog line — receive qty only. */
  receiveFromVariantId: z.string().optional(),
  brandId: z.string().min(1, 'Brand is required.'),
  productName: z.string().min(2, 'Product name is required.'),
  categoryId: z.string().min(1, 'Category is required.'),
  shadeName: z.string().optional(),
  shadeHex: z.string().optional(),
  packLabel: z.string().min(1, 'Pack size is required.'),
  branchId: z.string().min(1, 'Branch is required.'),
  purchaseCost: z.coerce.number().min(0, 'Purchase cost must be 0 or more.'),
  sellingCost: z.coerce.number().min(0, 'Selling cost must be 0 or more.'),
  qty: z.coerce.number().positive('Qty must be greater than zero.'),
  defaultDisplayUnit: z.enum(['L', 'ml', 'kg', 'g', 'nos']),
  expiryDate: z.string().min(1, 'Expiry date is required.'),
})

export function parseStockForm(
  data: unknown,
  categoryKind: InventoryCategoryKind | null
) {
  const needsShade = categoryKind === 'paint'
  return baseStockForm.superRefine((val, ctx) => {
    if (val.receiveFromVariantId) return
    if (needsShade) {
      if (!val.shadeName?.trim()) {
        ctx.addIssue({ code: 'custom', path: ['shadeName'], message: 'Shade name is required for paint.' })
      }
      const hex = val.shadeHex ?? ''
      if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        ctx.addIssue({ code: 'custom', path: ['shadeHex'], message: 'Pick a colour (hex like #E8E2D4).' })
      }
    }
  }).safeParse(data)
}

/** @deprecated use parseStockForm — kept for type export */
export const stockFormSchema = baseStockForm

export type StockFormValues = z.infer<typeof baseStockForm>