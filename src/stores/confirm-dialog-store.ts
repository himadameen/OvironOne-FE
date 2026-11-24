import { create } from 'zustand'

export type ConfirmDialogVariant = 'default' | 'danger'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: ConfirmDialogVariant
  /** Single OK button (no cancel) */
  alertOnly?: boolean
}

interface ConfirmDialogState {
  isOpen: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel: string
  variant: ConfirmDialogVariant
  alertOnly: boolean
  resolver: ((value: boolean) => void) | null
  open: (options: ConfirmOptions) => Promise<boolean>
  close: (confirmed: boolean) => void
}

export const useConfirmDialogStore = create<ConfirmDialogState>((set, get) => ({
  isOpen: false,
  title: '',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  variant: 'default',
  alertOnly: false,
  resolver: null,
  open: (options) =>
    new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        title: options.title,
        message: options.message,
        confirmLabel: options.confirmLabel ?? (options.alertOnly ? 'OK' : 'Confirm'),
        cancelLabel: options.cancelLabel ?? 'Cancel',
        variant: options.variant ?? 'default',
        alertOnly: options.alertOnly ?? false,
        resolver: resolve,
      })
    }),
  close: (confirmed) => {
    const { resolver } = get()
    resolver?.(confirmed)
    set({
      isOpen: false,
      resolver: null,
    })
  },
}))

export function confirmDialog(options: ConfirmOptions) {
  return useConfirmDialogStore.getState().open(options)
}