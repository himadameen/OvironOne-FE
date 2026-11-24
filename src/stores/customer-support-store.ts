import { create } from 'zustand'

interface CustomerSupportStore {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useCustomerSupportStore = create<CustomerSupportStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))

export function openCustomerSupport() {
  useCustomerSupportStore.getState().open()
}