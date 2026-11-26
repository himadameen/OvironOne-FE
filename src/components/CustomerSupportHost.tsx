import { createPortal } from 'react-dom'
import { Clock, Mail, MessageCircle, Phone, X } from 'lucide-react'
import { CUSTOMER_SUPPORT } from '@/data/customer-support'
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock'
import { useCustomerSupportStore } from '@/stores/customer-support-store'

export function CustomerSupportHost() {
  const isOpen = useCustomerSupportStore((s) => s.isOpen)
  const close = useCustomerSupportStore((s) => s.close)

  useBodyScrollLock(isOpen)

  if (!isOpen) return null

  const { title, subtitle, email, phoneDisplay, phoneTel, whatsapp, hours, responseNote } =
    CUSTOMER_SUPPORT

  return createPortal(
    <div className="confirm-backdrop" role="presentation">
      <div
        className="support-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="support-dialog-head">
          <div>
            <h2 id="support-dialog-title" className="confirm-dialog-title">
              {title}
            </h2>
            <p className="confirm-dialog-message">{subtitle}</p>
          </div>
          <button
            type="button"
            className="btn-ghost-light !h-9 !w-9 shrink-0 p-0"
            onClick={close}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="support-channel-list">
          <a className="support-channel" href={`mailto:${email}`}>
            <span className="support-channel-icon" aria-hidden>
              <Mail className="h-4 w-4" />
            </span>
            <span className="support-channel-copy">
              <span className="support-channel-label">Email</span>
              <span className="support-channel-value">{email}</span>
            </span>
          </a>
          <a className="support-channel" href={`tel:${phoneTel}`}>
            <span className="support-channel-icon" aria-hidden>
              <Phone className="h-4 w-4" />
            </span>
            <span className="support-channel-copy">
              <span className="support-channel-label">Phone</span>
              <span className="support-channel-value">{phoneDisplay}</span>
            </span>
          </a>
          <a
            className="support-channel"
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="support-channel-icon" aria-hidden>
              <MessageCircle className="h-4 w-4" />
            </span>
            <span className="support-channel-copy">
              <span className="support-channel-label">WhatsApp</span>
              <span className="support-channel-value">Message the support desk</span>
            </span>
          </a>
        </div>

        <div className="support-dialog-foot">
          <div className="support-hours">
            <span className="support-hours-icon" aria-hidden>
              <Clock className="h-4 w-4" />
            </span>
            <p className="support-hours-copy">
              <span className="support-hours-line">{hours}</span>
              <span className="support-hours-note">{responseNote}</span>
            </p>
          </div>
          <button type="button" className="btn-primary support-dialog-done" onClick={close}>
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}