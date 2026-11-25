import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import type { DisplayUnit, InventoryCategory, InventoryCategoryKind } from '@/inventory/types'
import { CatalogItemActiveToggle } from '@/components/inventory/CatalogActiveToggle'
import { cn } from '@/lib/utils'

const KIND_OPTIONS: { value: InventoryCategoryKind; label: string; hint: string }[] = [
  { value: 'paint', label: 'Paint', hint: 'Shade & hex required' },
  { value: 'accessory', label: 'Accessory', hint: 'Brushes, rollers, tools' },
  { value: 'consumable', label: 'Consumable', hint: 'Putty, thinner, fillers' },
]

const UNIT_OPTIONS: DisplayUnit[] = ['L', 'ml', 'kg', 'g', 'nos']

export type CategoryFormInput = {
  id?: string
  name: string
  description?: string
  kind: InventoryCategoryKind
  active: boolean
  defaultDisplayUnit: DisplayUnit
}

interface CategoryFormModalProps {
  open: boolean
  editing: InventoryCategory | null
  onClose: () => void
  onSave: (input: CategoryFormInput) => void
}

export function CategoryFormModal({ open, editing, onClose, onSave }: CategoryFormModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [kind, setKind] = useState<InventoryCategoryKind>('paint')
  const [unit, setUnit] = useState<DisplayUnit>('L')
  const [active, setActive] = useState(true)

  useEffect(() => {
    if (!open) return
    if (editing) {
      setName(editing.name)
      setDescription(editing.description ?? '')
      setKind(editing.kind)
      setUnit(editing.defaultDisplayUnit)
      setActive(editing.active)
    } else {
      setName('')
      setDescription('')
      setKind('paint')
      setUnit('L')
      setActive(true)
    }
  }, [open, editing])

  if (!open) return null

  const onKindChange = (next: InventoryCategoryKind) => {
    setKind(next)
    if (next === 'accessory') setUnit('nos')
    else if (next === 'consumable' && unit === 'nos') setUnit('kg')
    else if (next === 'paint' && unit === 'nos') setUnit('L')
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
    })
    onClose()
  }

  return (
    <div className="confirm-backdrop" role="presentation" onClick={onClose}>
      <div
        className="support-dialog stock-form-dialog"
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
              Controls default units and whether shade colour is required in Add stock.
            </p>
          </div>
          <button type="button" className="stocks-trade-close" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form className="stock-form" onSubmit={submit}>
          <div className="stock-form-scroll">
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
              <p className="stock-form-label" style={{ marginBottom: '0.35rem' }}>
                Type
              </p>
              <div className="catalog-kind-grid">
                {KIND_OPTIONS.map((opt) => (
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
              <label className="stock-form-field" style={{ marginTop: '0.75rem' }}>
                <span className="stock-form-label">Default unit</span>
                <select
                  className="stock-form-input"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as DisplayUnit)}
                >
                  {UNIT_OPTIONS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </label>
              <CatalogItemActiveToggle active={active} onChange={setActive} />
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