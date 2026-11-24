import { useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { getOverviewKpis, useInventoryStore } from '@/stores/inventory-store'

const SHOP_FALLBACK = 'shop-ambur'

export function useInventoryOverview() {
  const shopId = useAuthStore((s) => s.shopId) ?? SHOP_FALLBACK
  const movements = useInventoryStore((s) => s.movements)
  const batches = useInventoryStore((s) => s.batches)

  return useMemo(() => {
    const kpis = getOverviewKpis(shopId)
    const recent = movements
      .filter((m) => m.shopId === shopId)
      .sort((a, b) => b.at.localeCompare(a.at))
      .slice(0, 10)
    void batches
    return { shopId, kpis, recentMovements: recent }
  }, [shopId, movements, batches])
}