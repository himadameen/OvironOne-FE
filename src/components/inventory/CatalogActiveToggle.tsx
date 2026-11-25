import { cn } from '@/lib/utils'

export type CatalogStatusFilter = 'active' | 'inactive'

/** List filter — same chip styling as Stocks Mo/Yr toggles. */
export function CatalogActiveToggle({
  value,
  onChange,
}: {
  value: CatalogStatusFilter
  onChange: (value: CatalogStatusFilter) => void
}) {
  return (
    <div className="stocks-period-toggle" role="group" aria-label="Status filter">
      <button
        type="button"
        className={cn('stocks-period-chip', value === 'active' && 'stocks-period-chip--active')}
        aria-pressed={value === 'active'}
        onClick={() => onChange('active')}
      >
        Active
      </button>
      <button
        type="button"
        className={cn('stocks-period-chip', value === 'inactive' && 'stocks-period-chip--active')}
        aria-pressed={value === 'inactive'}
        onClick={() => onChange('inactive')}
      >
        Inactive
      </button>
    </div>
  )
}

/** Set a catalog row active or inactive in the add/edit form. */
export function CatalogItemActiveToggle({
  active,
  onChange,
}: {
  active: boolean
  onChange: (active: boolean) => void
}) {
  return (
    <div className="catalog-crud-active-row">
      <span className="stock-form-label">Status</span>
      <div className="stocks-period-toggle" role="group" aria-label="Active or inactive">
        <button
          type="button"
          className={cn('stocks-period-chip', active && 'stocks-period-chip--active')}
          aria-pressed={active}
          onClick={() => onChange(true)}
        >
          Active
        </button>
        <button
          type="button"
          className={cn('stocks-period-chip', !active && 'stocks-period-chip--active')}
          aria-pressed={!active}
          onClick={() => onChange(false)}
        >
          Inactive
        </button>
      </div>
    </div>
  )
}