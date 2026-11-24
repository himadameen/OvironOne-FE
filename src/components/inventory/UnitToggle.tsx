import { cn } from '@/lib/utils'
import type { DisplayUnit } from '@/inventory/types'

interface UnitToggleProps {
  value: DisplayUnit
  options: DisplayUnit[]
  onChange: (unit: DisplayUnit) => void
  className?: string
  id?: string
}

export function UnitToggle({ value, options, onChange, className, id }: UnitToggleProps) {
  return (
    <div
      id={id}
      className={cn('inline-flex flex-wrap gap-1 rounded-lg border border-silver bg-table-header p-0.5', className)}
      role="group"
      aria-label="Unit"
    >
      {options.map((unit) => (
        <button
          key={unit}
          type="button"
          className={cn(
            'rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide transition',
            value === unit
              ? 'bg-brand-primary text-brand-primary-foreground shadow-sm'
              : 'text-muted hover:bg-row-hover'
          )}
          onClick={() => onChange(unit)}
          aria-pressed={value === unit}
        >
          {unit}
        </button>
      ))}
    </div>
  )
}