import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createShopProfileBundle } from '@/data/mock-company-profile'
import type { Branch, CompanyProfile, ProprietorProfile, StaffAccessProfile } from '@/types'

const newId = () => `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

interface ShopProfileState {
  shopId: string | null
  company: CompanyProfile | null
  proprietor: ProprietorProfile | null
  branches: Branch[]
  staff: StaffAccessProfile[]
  displayPhotoUrl: string | null
  ensureLoaded: (shopId: string) => void
  resetFromDemo: (shopId: string) => void
  setDisplayPhotoUrl: (url: string | null) => void
  updateCompany: (patch: Partial<CompanyProfile>) => void
  updateProprietor: (patch: Partial<ProprietorProfile>) => void
  addBranch: (branch: Omit<Branch, 'id'>) => void
  updateBranch: (id: string, patch: Partial<Branch>) => void
  deleteBranch: (id: string) => void
  addStaff: (person: Omit<StaffAccessProfile, 'id'>) => void
  updateStaff: (id: string, patch: Partial<StaffAccessProfile>) => void
  deleteStaff: (id: string) => void
}

export const useShopProfileStore = create<ShopProfileState>()(
  persist(
    (set, get) => ({
      shopId: null,
      company: null,
      proprietor: null,
      branches: [],
      staff: [],
      displayPhotoUrl: null,
      ensureLoaded: (shopId) => {
        if (get().shopId === shopId && get().company) return
        const bundle = createShopProfileBundle(shopId)
        if (!bundle) return
        set({
          shopId,
          company: bundle.company,
          proprietor: bundle.proprietor,
          branches: bundle.branches,
          staff: bundle.staff,
        })
      },
      resetFromDemo: (shopId) => {
        const bundle = createShopProfileBundle(shopId)
        if (!bundle) return
        set({
          shopId,
          company: bundle.company,
          proprietor: bundle.proprietor,
          branches: bundle.branches,
          staff: bundle.staff,
          displayPhotoUrl: null,
        })
      },
      setDisplayPhotoUrl: (displayPhotoUrl) => set({ displayPhotoUrl }),
      updateCompany: (patch) =>
        set((s) =>
          s.company ? { company: { ...s.company, ...patch } } : {}
        ),
      updateProprietor: (patch) =>
        set((s) =>
          s.proprietor ? { proprietor: { ...s.proprietor, ...patch } } : {}
        ),
      addBranch: (branch) =>
        set((s) => ({
          branches: [...s.branches, { ...branch, id: newId() }],
        })),
      updateBranch: (id, patch) =>
        set((s) => ({
          branches: s.branches.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        })),
      deleteBranch: (id) =>
        set((s) => ({
          branches:
            s.branches.length <= 1
              ? s.branches
              : s.branches.filter((b) => b.id !== id),
        })),
      addStaff: (person) =>
        set((s) => ({
          staff: [...s.staff, { ...person, id: newId() }],
        })),
      updateStaff: (id, patch) =>
        set((s) => ({
          staff: s.staff.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),
      deleteStaff: (id) =>
        set((s) => ({
          staff: s.staff.filter((p) => p.id !== id),
        })),
    }),
    {
      name: 'oviron-shop-profile',
      partialize: (s) => ({
        shopId: s.shopId,
        company: s.company,
        proprietor: s.proprietor,
        branches: s.branches,
        staff: s.staff,
        displayPhotoUrl: s.displayPhotoUrl,
      }),
    }
  )
)