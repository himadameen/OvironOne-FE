import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { DisplayUnit, InventoryCategory, InventoryCategoryKind } from '@/inventory/types'
import {
  CATEGORY_KIND_CONFIG,
  categoryKindOptions,
  unitsForCategoryKind,
} from '@/inventory/category-kind-config'
import { CategoryKindStockGuide } from '@/components/inventory/CategoryKindStockGuide'
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock'
import { CatalogItemActiveToggle } from '@/components/inventory/CatalogActiveToggle'
import { cn } from '@/lib/utils'

export type CategoryFormInput = {
  id?: string
  name: string
  description?: string
  kind: InventoryCategoryKind
  active: boolean
  defaultDisplayUnit: DisplayUnit
  defaultPackLabel?: string
  trackExpiry?: boolean
}

interface CategoryFormModalProps {
  open: boolean
  editing: InventoryCategory | null
  onClose: () => void
  onSave: (input: CategoryFormInput) => void
}

function TrackExpiryToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="inv-field-block inv-field-block--toggle">
      <div className="inv-field-block-head">
        <span className="stock-form-label">Expiry in Add stock</span>
        <span className="inv-field-block-hint">
          {value ? 'Staff must enter expiry when receiving.' : 'Expiry field hidden on Add stock.'}
        </span>
      </div>
      <div className="stocks-period-toggle" role="group" aria-label="Track expiry">
        <button
          type="button"
          className={cn('stocks-period-chip', value && 'stocks-period-chip--active')}
          aria-pressed={value}
          onClick={() => onChange(true)}
        >
          Track expiry
        </button>
        <button
          type="button"
          className={cn('stocks-period-chip', !value && 'stocks-period-chip--active')}
          aria-pressed={!value}
          onClick={() => onChange(false)}
        >
          Not required
        </button>
      </div>
    </div>
  )
}

export function CategoryFormModal({ open, editing, onClose, onSave }: CategoryFormModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [kind, setKind] = useState<InventoryCategoryKind>('paint')
  const [unit, setUnit] = useState<DisplayUnit>('L')
  const [defaultPackLabel, setDefaultPackLabel] = useState('')
  const [trackExpiry, setTrackExpiry] = useState(true)
  const [active, setActive] = useState(true)

  const kindConfig = CATEGORY_KIND_CONFIG[kind]
  const unitOptions = useMemo(() => unitsForCategoryKind(kind), [kind])

  useEffect(() => {
    if (!open) return
    if (editing) {
      const cfg = CATEGORY_KIND_CONFIG[editing.kind]
      setName(editing.name)
      setDescription(editing.description ?? '')
      setKind(editing.kind)
      setUnit(editing.defaultDisplayUnit)
      setDefaultPackLabel(editing.defaultPackLabel ?? cfg.defaultPackLabel)
      setTrackExpiry(editing.trackExpiry ?? cfg.trackExpiryDefault)
      setActive(editing.active)
    } else {
      const cfg = CATEGORY_KIND_CONFIG.paint
      setName('')
      setDescription('')
      setKind('paint')
      setUnit(cfg.defaultUnit)
      setDefaultPackLabel(cfg.defaultPackLabel)
      setTrackExpiry(cfg.trackExpiryDefault)
      setActive(true)
    }
  }, [open, editing])

  useBodyScrollLock(open)

  if (!open) return null

  const onKindChange = (next: InventoryCategoryKind) => {
    const cfg = CATEGORY_KIND_CONFIG[next]
    setKind(next)
    setUnit(cfg.defaultUnit)
    setDefaultPackLabel(cfg.defaultPackLabel)
    setTrackExpiry(cfg.trackExpiryDefault)
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({
      id: editing?.id,
      name,
      description: description.trim() || undefined,
      kind,
      active,
      defaultDisplayUnit: unit,
      defaultPackLabel: defaultPackLabel.trim() || undefined,
      trackExpiry,
    })
    onClose()
  }

  const kindOptions = categoryKindOptions()

  return (
    <div className="confirm-backdrop" role="presentation">
      <div
        className="support-dialog stock-form-dialog stock-form-dialog--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="stock-form-dialog-head">
          <div>
            <h2 id="category-form-title" className="stock-form-dialog-title">
              {editing ? 'Edit category' : 'Add category'}
            </h2>
            <p className="stock-form-dialog-sub">
              Pick a type first — fields below match what Add stock needs for paint, tools, or consumables.
            </p>
          </div>
          <button type="button" className="stocks-trade-close" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form className="stock-form" onSubmit={submit}>
          <div className="stock-form-scroll">
            <section className="stock-form-section">
              <h3 className="stock-form-section-title">Type</h3>
              <div className="catalog-kind-grid">
                {kindOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={cn('catalog-kind-card', kind === opt.value && 'catalog-kind-card--on')}
                    onClick={() => onKindChange(opt.value)}
                  >
                    <span className="catalog-kind-card-label">{opt.label}</span>
                    <span className="catalog-kind-card-hint">{opt.hint}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="stock-form-section">
              <h3 className="stock-form-section-title">Details</h3>
              <div className="stock-form-grid">
                <label className="stock-form-field stock-form-field--full">
                  <span className="stock-form-label">Name *</span>
                  <input className="stock-form-input" value={name} onChange={(e) => setName(e.target.value)} required />
                </label>
                <label className="stock-form-field stock-form-field--full">
                  <span className="stock-form-label">Description</span>
                  <input
                    className="stock-form-input"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Optional note for staff"
                  />
                </label>
              </div>
              <CatalogItemActiveToggle active={active} onChange={setActive} />
            </section>

            <section className="stock-form-section">
              <h3 className="stock-form-section-title">{kindConfig.stockRulesTitle}</h3>
              <CategoryKindStockGuide kind={kind} config={kindConfig} />

              <div className="stock-form-grid inv-field-block-gap">
                <label className="stock-form-field">
                  <span className="stock-form-label">{kindConfig.unitLabel}</span>
                  <select
                    className="stock-form-input"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as DisplayUnit)}
                  >
                    {unitOptions.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="stock-form-field">
                  <span className="stock-form-label">Default pack</span>
                  <input
                    className="stock-form-input"
                    value={defaultPackLabel}
                    onChange={(e) => setDefaultPackLabel(e.target.value)}
                    placeholder={kindConfig.defaultPackLabel}
                  />
                </label>
              </div>

              <div className="inv-field-block">
                <div className="inv-field-block-head">
                  <span className="stock-form-label">Pack presets</span>
                  <span className="inv-field-block-hint">Tap to fill default pack</span>
                </div>
                <div className="catalog-pack-presets">
                {kindConfig.packPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    className={cn(
                      'stocks-period-chip',
                      defaultPackLabel === preset && 'stocks-period-chip--active'
                    )}
                    onClick={() => setDefaultPackLabel(preset)}
                  >
                    {preset}
                  </button>
                ))}
                </div>
              </div>

              <TrackExpiryToggle value={trackExpiry} onChange={setTrackExpiry} />
            </section>
          </div>

          <footer className="stock-form-foot">
            <button type="button" className="btn-secondary !h-10 px-5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary !h-10 px-5 text-sm">
              Save category
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}