import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { BrandCatalogPanel } from '@/components/inventory/BrandCatalogPanel'
import { InventoryCatalogPageLayout } from '@/components/inventory/InventoryCatalogPageLayout'
import { useAuthStore } from '@/stores/auth-store'
import { useInventoryStore } from '@/stores/inventory-store'

export function InventoryBrandsPage() {
  const shopId = useAuthStore((s) => s.shopId) ?? 'shop-ambur'
  const brands = useInventoryStore((s) => s.brands)
  const variants = useInventoryStore((s) => s.variants).filter((v) => v.shopId === shopId)
  const upsertBrand = useInventoryStore((s) => s.upsertBrand)

  const shopBrands = brands.filter((b) => b.shopId === shopId)

  const skuCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const v of variants) {
      if (v.shopId !== shopId) continue
      const id = v.brandId ?? shopBrands.find((b) => b.name === v.brand)?.id
      if (!id) continue
      counts[id] = (counts[id] ?? 0) + 1
    }
    return counts
  }, [variants, shopId, shopBrands])

  return (
    <InventoryCatalogPageLayout
      title="Brands"
      description={
        <>
          Supplier and house labels — renaming updates linked SKUs. Only <strong>active</strong> brands appear in{' '}
          <Link to="/admin/inventory">
            Add stock
          </Link>
          .
        </>
      }
    >
      <BrandCatalogPanel
        brands={shopBrands}
        variants={variants}
        skuCounts={skuCounts}
        onSave={(input) => upsertBrand(shopId, input)}
      />
    </InventoryCatalogPageLayout>
  )
}