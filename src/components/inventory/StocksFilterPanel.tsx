import type { ReactNode } from 'react'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ExpiryFilter, MarginFilter, StocksFilterState } from '@/inventory/stock-filters'
import type { InventoryCategory } from '@/inventory/types'

interface StocksFilterPanelProps {
  filters: StocksFilterState
  brands: string[]
  categories: InventoryCategory[]
  onChange: (patch: Partial<StocksFilterState>) => void
  onReset: () => void
  compactLabels?: boolean
}

export function StocksFilterPanel({
  filters,
  brands,
  categories,
  onChange,
  onReset,
  compactLabels,
}: StocksFilterPanelProps) {
  return (
    <div className="stocks-filter-panel">
      <div className="stocks-filter-panel-head">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-brand-primary" aria-hidden />
          <span className="stocks-filter-title">Refine stock</span>
        </div>
        <button type="button" className="stocks-filter-reset" onClick={onReset}>
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Reset
        </button>
      </div>

      <div className="stocks-filter-grid stocks-filter-grid--refine">
        <FilterField label="Brand">
          <select
            className="stocks-filter-select"
            value={filters.brandFilter}
            onChange={(e) => onChange({ brandFilter: e.target.value })}
          >
            <option value="all">All brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Category">
          <select
            className="stocks-filter-select"
            value={filters.categoryFilter}
            onChange={(e) => onChange({ categoryFilter: e.target.value })}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label={compactLabels ? 'Exp' : 'Expiry'}>
          <select
            className="stocks-filter-select"
            value={filters.expiryFilter}
            onChange={(e) => onChange({ expiryFilter: e.target.value as ExpiryFilter })}
          >
            <option value="all">Any status</option>
            <option value="ok">OK (&gt;30d)</option>
            <option value="expiring">{compactLabels ? 'Exp soon' : 'Expiring soon'}</option>
            <option value="expired">{compactLabels ? 'Exp' : 'Expired'}</option>
          </select>
        </FilterField>

        <FilterField label="Margin">
          <select
            className="stocks-filter-select"
            value={filters.marginFilter}
            onChange={(e) => onChange({ marginFilter: e.target.value as MarginFilter })}
          >
            <option value="all">Any margin</option>
            <option value="high">High (≥25%)</option>
            <option value="low">Low (&lt;20%)</option>
          </select>
        </FilterField>
      </div>
    </div>
  )
}

function FilterField({
  label,
  wide,
  children,
}: {
  label: string
  wide?: boolean
  children: ReactNode
}) {
  return (
    <div className={cn('stocks-filter-field', wide && 'stocks-filter-field--wide')}>
      <span className="stocks-filter-field-label">{label}</span>
      {children}
    </div>
  )
}