import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { CategoryCatalogPanel } from '@/components/inventory/CategoryCatalogPanel'
import { InventoryCatalogPageLayout } from '@/components/inventory/InventoryCatalogPageLayout'
import { useAuthStore } from '@/stores/auth-store'
import { useInventoryStore } from '@/stores/inventory-store'

export function InventoryCategoriesPage() {
  const shopId = useAuthStore((s) => s.shopId) ?? 'shop-ambur'
  const categories = useInventoryStore((s) => s.categories)
  const variants = useInventoryStore((s) => s.variants).filter((v) => v.shopId === shopId)
  const upsertCategory = useInventoryStore((s) => s.upsertCategory)

  const shopCats = categories.filter((c) => c.shopId === shopId)

  const variantCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const v of variants) {
      if (v.shopId !== shopId) continue
      counts[v.categoryId] = (counts[v.categoryId] ?? 0) + 1
    }
    return counts
  }, [variants, shopId])

  return (
    <InventoryCatalogPageLayout
      title="Categories"
      description={
        <>
          <strong>Paint</strong> needs shade and colour; <strong>accessories</strong> use pieces (nos). Used in{' '}
          <Link to="/admin/inventory">
            Add stock
          </Link>
          .
        </>
      }
    >
      <CategoryCatalogPanel
        categories={shopCats}
        variants={variants}
        variantCounts={variantCounts}
        onSave={(input) => upsertCategory(shopId, input)}
      />
    </InventoryCatalogPageLayout>
  )
}