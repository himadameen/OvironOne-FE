import { CATEGORY_KIND_CONFIG } from '@/inventory/category-kind-config'
import type { InventoryCategoryKind, ProductVariant } from '@/inventory/types'

export interface CatalogSearchHit {
  variantId: string
  label: string
  sublabel: string
  score: number
}

export function searchCatalogVariants(
  variants: ProductVariant[],
  shopId: string,
  query: string,
  limit = 12
): CatalogSearchHit[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const hits: CatalogSearchHit[] = []
  for (const v of variants) {
    if (v.shopId !== shopId) continue
    const hay = [
      v.productName,
      v.brand,
      v.categoryName,
      v.shadeName,
      v.packLabel,
      v.sku,
    ]
      .join(' ')
      .toLowerCase()
    const tokens = q.split(/\s+/).filter(Boolean)
    if (!tokens.every((tok) => hay.includes(tok))) continue
    const label = v.productName
    const sublabel = [v.brand, v.shadeName, v.packLabel, v.sku].filter(Boolean).join(' · ')
    let score = 0
    if (v.productName.toLowerCase().startsWith(q)) score += 4
    if (v.brand.toLowerCase().includes(q)) score += 2
    if (v.sku.toLowerCase().includes(q)) score += 3
    if (v.shadeName.toLowerCase().includes(q)) score += 1
    hits.push({ variantId: v.id, label, sublabel, score })
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit)
}

export function categoryNeedsShade(kind: InventoryCategoryKind): boolean {
  return CATEGORY_KIND_CONFIG[kind].requiresShade
}