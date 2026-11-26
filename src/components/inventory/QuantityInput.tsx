import { cn } from '@/lib/utils'
import type { BaseUnitKind, DisplayUnit } from '@/inventory/types'
import { conversionHint, unitsForQuantityInput } from '@/inventory/units'
import { UnitToggle } from '@/components/inventory/UnitToggle'

interface QuantityInputProps {
  qty: number
  unit: DisplayUnit
  kind: BaseUnitKind
  densityKgPerL?: number
  onQtyChange: (qty: number) => void
  onUnitChange: (unit: DisplayUnit) => void
  className?: string
  inputId?: string
  min?: number
  step?: number
  /** Use stock-form field styling (batch lot modals). */
  variant?: 'default' | 'stock-form'
}

export function QuantityInput({
  qty,
  unit,
  kind,
  densityKgPerL,
  onQtyChange,
  onUnitChange,
  className,
  inputId = 'qty-input',
  min = 0,
  step = 0.01,
  variant = 'default',
}: QuantityInputProps) {
  const stockForm = variant === 'stock-form'
  const options = unitsForQuantityInput(kind, densityKgPerL)
  const hint =
    qty > 0 ? conversionHint(qty, unit, kind, densityKgPerL) : null

  if (stockForm) {
    return (
      <div className={cn('stock-form-qty-block', className)}>
        <span className="stock-form-label" id={`${inputId}-label`}>
          Quantity
        </span>
        <div className="stock-form-qty-row">
          <input
            id={inputId}
            type="number"
            aria-labelledby={`${inputId}-label`}
            className="stock-form-input tabular-nums stock-form-qty-input"
            min={min}
            step={kind === 'count' ? 1 : step}
            value={Number.isFinite(qty) ? qty : ''}
            onChange={(e) => onQtyChange(Number(e.target.value))}
          />
          <UnitToggle
            value={unit}
            options={options}
            onChange={onUnitChange}
            className="stock-form-unit-toggle"
          />
        </div>
        {hint ? <p className="stock-form-qty-hint">{hint}</p> : null}
        {kind === 'volume' && !densityKgPerL ? (
          <p className="stock-form-error">Density required for L ↔ kg conversion on this SKU.</p>
        ) : null}
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-[8rem] flex-1 space-y-1">
          <span className="text-small font-medium text-muted">Quantity</span>
          <input
            id={inputId}
            type="number"
            className="input-field !h-10"
            min={min}
            step={kind === 'count' ? 1 : step}
            value={Number.isFinite(qty) ? qty : ''}
            onChange={(e) => onQtyChange(Number(e.target.value))}
          />
        </label>
        <UnitToggle value={unit} options={options} onChange={onUnitChange} />
      </div>
      {hint ? <p className="text-xs text-muted">{hint}</p> : null}
      {kind === 'volume' && !densityKgPerL ? (
        <p className="text-xs text-brand-secondary">Density required for L ↔ kg conversion on this SKU.</p>
      ) : null}
    </div>
  )
}