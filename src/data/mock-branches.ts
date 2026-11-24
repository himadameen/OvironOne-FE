import type { Branch } from '@/types'

export const mockBranches: Branch[] = [
  {
    id: 'branch-ambur-main',
    shopId: 'shop-ambur',
    name: 'Branch A — Main street',
    code: 'A',
    city: 'Ambur',
    isPrimary: true,
  },
  {
    id: 'branch-ambur-yard',
    shopId: 'shop-ambur',
    name: 'Branch B — Yard & warehouse',
    code: 'B',
    city: 'Ambur',
  },
  {
    id: 'branch-hardware-main',
    shopId: 'shop-hardware',
    name: 'Chennai showroom',
    code: 'A',
    city: 'Chennai',
    isPrimary: true,
  },
]

export function branchesForShop(shopId: string): Branch[] {
  return mockBranches.filter((b) => b.shopId === shopId)
}