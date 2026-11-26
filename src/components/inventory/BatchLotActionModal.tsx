import { type FormEvent, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock'
import { cn } from '@/lib/utils'

interface BatchLotActionModalProps {
  open: boolean
  title: string
  subtitle: string
  ariaTitleId: string
  footerHint?: string
  submitLabel: string
  onClose: () => void
  onSubmit: (e: FormEvent) => void
  children: ReactNode
  submitDisabled?: boolean
}

export function BatchLotActionModal({
  open,
  title,
  subtitle,
  ariaTitleId,
  footerHint,
  submitLabel,
  onClose,
  onSubmit,
  children,
  submitDisabled,
}: BatchLotActionModalProps) {
  useBodyScrollLock(open)

  if (!open) return null

  return (
    <div className="confirm-backdrop" role="presentation">
      <div
        className="support-dialog stock-form-dialog batch-lot-action-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaTitleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="stock-form-dialog-head">
          <div className="min-w-0">
            <h2 id={ariaTitleId} className="stock-form-dialog-title">
              {title}
            </h2>
            <p className="stock-form-dialog-sub !mb-0">{subtitle}</p>
          </div>
          <button type="button" className="stocks-trade-close" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form className="stock-form batch-lot-action-form" onSubmit={onSubmit}>
          <div className="stock-form-scroll">{children}</div>
          <footer className="stock-form-foot">
            {footerHint ? <p className="stock-form-foot-hint">{footerHint}</p> : <span className="flex-1" />}
            <div className="stock-form-foot-actions">
              <button type="button" className="btn-secondary !h-10 px-5 text-sm" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary !h-10 px-5 text-sm"
                disabled={submitDisabled}
              >
                {submitLabel}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  )
}

export function StockFormField({
  label,
  error,
  children,
  className,
  full,
}: {
  label: string
  error?: string
  children: ReactNode
  className?: string
  full?: boolean
}) {
  return (
    <div className={cn('stock-form-field', full && 'stock-form-field--full', className)}>
      <span className="stock-form-label">{label}</span>
      {children}
      {error ? (
        <p className="stock-form-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export function StockFormCallout({ children }: { children: ReactNode }) {
  return <p className="stock-form-callout">{children}</p>
}