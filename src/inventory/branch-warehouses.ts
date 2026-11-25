import { branchesForShop } from '@/data/mock-branches'

const BRANCH_TO_WAREHOUSE: Record<string, string> = {
  'branch-ambur-main': 'wh-main',
  'branch-ambur-yard': 'wh-yard',
}

export function warehouseForBranch(branchId: string): string | undefined {
  return BRANCH_TO_WAREHOUSE[branchId]
}

export function warehouseIdsForBranchFilter(_shopId: string, branchId: string | 'all'): string[] | null {
  if (branchId === 'all') return null
  const mapped = warehouseForBranch(branchId)
  if (mapped) return [mapped]
  return [branchId]
}

export function branchLabelForWarehouse(shopId: string, warehouseId: string): string {
  const branches = branchesForShop(shopId)
  for (const b of branches) {
    if (warehouseForBranch(b.id) === warehouseId) {
      return b.name.startsWith('Branch') ? b.name.split('—')[0]?.trim() ?? b.name : b.name
    }
  }
  return warehouseId
}