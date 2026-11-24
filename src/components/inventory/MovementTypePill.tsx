import { cn } from '@/lib/utils'
import type { MovementType } from '@/inventory/types'

const LABELS: Record<MovementType, string> = {
  purchase: 'Purchase',
  adjustment: 'Adjustment',
  transfer: 'Transfer',
  sale: 'Sale',
  opening: 'Opening',
}

interface MovementTypePillProps {
  type: MovementType
  className?: string
}

export function MovementTypePill({ type, className }: MovementTypePillProps) {
  return (
    <span
      className={cn(
        'inv-pill',
        type === 'purchase' && 'inv-pill--purchase',
        type === 'adjustment' && 'inv-pill--adjustment',
        type === 'transfer' && 'inv-pill--transfer',
        type === 'sale' && 'inv-pill--sale',
        type === 'opening' && 'inv-pill--opening',
        className
      )}
    >
      {LABELS[type]}
    </span>
  )
}