import { cn } from '@/lib/utils'
import type { StockHealth } from '@/inventory/types'

const LABELS: Record<StockHealth, string> = {
  ok: 'OK',
  low: 'Low',
  oos: 'Out of stock',
  expired: 'Expired',
  expiring: 'Expiring',
}

interface StockStatusBadgeProps {
  status: StockHealth
  className?: string
}

export function StockStatusBadge({ status, className }: StockStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inv-badge',
        status === 'ok' && 'inv-badge--green',
        status === 'low' && 'inv-badge--amber',
        status === 'expiring' && 'inv-badge--amber',
        status === 'expired' && 'inv-badge--red',
        status === 'oos' && 'inv-badge--red',
        className
      )}
    >
      {LABELS[status]}
    </span>
  )
}