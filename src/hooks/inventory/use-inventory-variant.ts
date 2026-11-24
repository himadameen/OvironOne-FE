import { useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { getVariantDetail, useInventoryStore } from '@/stores/inventory-store'

const SHOP_FALLBACK = 'shop-ambur'

export function useInventoryVariant(variantId: string | undefined) {
  const shopId = useAuthStore((s) => s.shopId) ?? SHOP_FALLBACK
  const batches = useInventoryStore((s) => s.batches)
  const movements = useInventoryStore((s) => s.movements)

  return useMemo(() => {
    if (!variantId) return null
    return getVariantDetail(shopId, variantId)
  }, [shopId, variantId, batches, movements])
}