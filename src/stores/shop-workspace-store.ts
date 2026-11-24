import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BranchFilter = 'all' | string

interface ShopWorkspaceState {
  branchId: BranchFilter
  posOpen: boolean
  setBranchId: (branchId: BranchFilter) => void
  openPos: () => void
  closePos: () => void
  togglePos: () => void
  resetForShop: () => void
}

export const useShopWorkspaceStore = create<ShopWorkspaceState>()(
  persist(
    (set) => ({
      branchId: 'all',
      posOpen: false,
      setBranchId: (branchId) => set({ branchId }),
      openPos: () => set({ posOpen: true }),
      closePos: () => set({ posOpen: false }),
      togglePos: () => set((s) => ({ posOpen: !s.posOpen })),
      resetForShop: () => set({ branchId: 'all', posOpen: false }),
    }),
    { name: 'oviron-shop-workspace' }
  )
)