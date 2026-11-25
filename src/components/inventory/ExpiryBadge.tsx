import { cn } from '@/lib/utils'
import { daysUntilExpiry, expiryTone } from '@/inventory/expiry'
import { expiryBadgeLabel } from '@/inventory/stock-labels'

interface ExpiryBadgeProps {
  expiryDate: string
  className?: string
  /** Shorter copy for stocks table */
  compact?: boolean
}

export function ExpiryBadge({ expiryDate, className, compact }: ExpiryBadgeProps) {
  const days = daysUntilExpiry(expiryDate)
  const tone = expiryTone(expiryDate)
  const label = expiryBadgeLabel(days, tone, Boolean(compact))

  return (
    <span
      className={cn(
        'inv-badge',
        tone === 'green' && 'inv-badge--green',
        tone === 'amber' && 'inv-badge--amber',
        tone === 'red' && 'inv-badge--red',
        className
      )}
    >
      {label}
    </span>
  )
}