import type { ProductVariant } from '@/inventory/types'

export interface ProductTemplate {
  productId: string
  productName: string
  brand: string
  categoryId: string
  categoryName: string
  variantCount: number
  sampleVariantId: string
}

/** Group SKUs by product line (same productId) for quick pick when adding a new shade/pack. */
export function listProductTemplates(variants: ProductVariant[], shopId: string, limit = 8): ProductTemplate[] {
  const byProduct = new Map<string, ProductVariant[]>()
  for (const v of variants) {
    if (v.shopId !== shopId) continue
    const list = byProduct.get(v.productId) ?? []
    list.push(v)
    byProduct.set(v.productId, list)
  }

  const templates: ProductTemplate[] = []
  for (const [productId, list] of byProduct) {
    const head = list[0]
    templates.push({
      productId,
      productName: head.productName,
      brand: head.brand,
      categoryId: head.categoryId,
      categoryName: head.categoryName,
      variantCount: list.length,
      sampleVariantId: head.id,
    })
  }

  return templates.sort((a, b) => b.variantCount - a.variantCount || a.productName.localeCompare(b.productName)).slice(0, limit)
}