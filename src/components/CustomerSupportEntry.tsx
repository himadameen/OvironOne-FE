import { LifeBuoy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { openCustomerSupport } from '@/stores/customer-support-store'

interface CustomerSupportEntryProps {
  compact?: boolean
  className?: string
}

export function CustomerSupportEntry({ compact, className }: CustomerSupportEntryProps) {
  return (
    <button
      type="button"
      className={cn(
        'sidebar-support',
        compact && 'sidebar-support--compact',
        className
      )}
      onClick={openCustomerSupport}
      title="Customer support"
    >
      <span className="sidebar-support-icon" aria-hidden>
        <LifeBuoy className="support-icon-spin h-4 w-4" />
      </span>
      {!compact ? (
        <span className="min-w-0 flex-1 text-left">
          <span className="block truncate text-xs font-semibold text-charcoal">
            Customer support
          </span>
          <span className="block truncate text-[11px] text-muted">Contact the Oviron team</span>
        </span>
      ) : (
        <span className="sr-only">Customer support</span>
      )}
    </button>
  )
}