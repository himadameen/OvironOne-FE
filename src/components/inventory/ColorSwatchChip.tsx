import { cn } from '@/lib/utils'

interface ColorSwatchChipProps {
  hex: string
  label?: string
  className?: string
}

export function ColorSwatchChip({ hex, label, className }: ColorSwatchChipProps) {
  const isNeutral = hex === '#D8D2C8' || label === '—'
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className="h-6 w-6 shrink-0 rounded-md border border-silver shadow-inner"
        style={{ backgroundColor: hex }}
        title={label ?? hex}
        aria-hidden
      />
      {label && !isNeutral ? (
        <span className="text-sm font-medium">{label}</span>
      ) : label === '—' ? (
        <span className="text-sm text-muted">No shade</span>
      ) : null}
    </span>
  )
}