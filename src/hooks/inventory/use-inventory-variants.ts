import { useMemo, useState } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { getVariantRows, useInventoryStore } from '@/stores/inventory-store'
import type { StockQuickFilter } from '@/inventory/types'

const SHOP_FALLBACK = 'shop-ambur'

export function useInventoryVariants() {
  const shopId = useAuthStore((s) => s.shopId) ?? SHOP_FALLBACK
  const batches = useInventoryStore((s) => s.batches)
  const movements = useInventoryStore((s) => s.movements)

  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [warehouseId, setWarehouseId] = useState('all')
  const [statusFilter, setStatusFilter] = useState<StockQuickFilter>('all')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const rows = useMemo(() => {
    let list = getVariantRows(shopId, statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.variant.productName.toLowerCase().includes(q) ||
          r.variant.sku.toLowerCase().includes(q) ||
          r.variant.brand.toLowerCase().includes(q) ||
          r.variant.shadeName.toLowerCase().includes(q)
      )
    }
    if (categoryId !== 'all') {
      list = list.filter((r) => r.variant.categoryId === categoryId)
    }
    if (warehouseId !== 'all') {
      list = list.filter((r) => r.variant.warehouseId === warehouseId)
    }
    return list
  }, [shopId, statusFilter, search, categoryId, warehouseId, batches, movements])

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
  const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)

  return {
    shopId,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    warehouseId,
    setWarehouseId,
    statusFilter,
    setStatusFilter,
    page,
    setPage,
    totalPages,
    rows: pageRows,
    allRows: rows,
    categories: useInventoryStore.getState().categories.filter((c) => c.shopId === shopId),
    warehouses: useInventoryStore.getState().warehouses.filter((w) => w.shopId === shopId),
  }
}