import { cn } from '@/lib/utils'
import { daysUntilExpiry, expiryTone } from '@/inventory/expiry'

interface ExpiryBadgeProps {
  expiryDate: string
  className?: string
}

export function ExpiryBadge({ expiryDate, className }: ExpiryBadgeProps) {
  const days = daysUntilExpiry(expiryDate)
  const tone = expiryTone(expiryDate)
  const label =
    days < 0
      ? `Expired ${Math.abs(days)}d ago`
      : days === 0
        ? 'Expires today'
        : `${days}d left`

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