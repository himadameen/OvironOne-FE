import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock'
import { useConfirmDialogStore } from '@/stores/confirm-dialog-store'

export function ConfirmDialogHost() {
  const isOpen = useConfirmDialogStore((s) => s.isOpen)
  const title = useConfirmDialogStore((s) => s.title)
  const message = useConfirmDialogStore((s) => s.message)
  const confirmLabel = useConfirmDialogStore((s) => s.confirmLabel)
  const cancelLabel = useConfirmDialogStore((s) => s.cancelLabel)
  const variant = useConfirmDialogStore((s) => s.variant)
  const alertOnly = useConfirmDialogStore((s) => s.alertOnly)
  const close = useConfirmDialogStore((s) => s.close)

  useBodyScrollLock(isOpen)

  if (!isOpen) return null

  return createPortal(
    <div className="confirm-backdrop" role="presentation">
      <div
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="confirm-dialog-title">
          {title}
        </h2>
        <p id="confirm-dialog-desc" className="confirm-dialog-message">
          {message}
        </p>
        <div className="confirm-dialog-actions">
          {!alertOnly ? (
            <button type="button" className="btn-secondary !h-10 px-4 text-sm" onClick={() => close(false)}>
              {cancelLabel}
            </button>
          ) : null}
          <button
            type="button"
            className={cn(
              '!h-10 px-4 text-sm',
              variant === 'danger' ? 'btn-danger' : 'btn-primary'
            )}
            onClick={() => close(true)}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}