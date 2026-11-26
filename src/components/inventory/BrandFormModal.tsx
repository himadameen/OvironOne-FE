import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock'
import type { BrandFormInput, InventoryBrand } from '@/inventory/types'
import { CatalogItemActiveToggle } from '@/components/inventory/CatalogActiveToggle'

interface BrandFormModalProps {
  open: boolean
  editing: InventoryBrand | null
  onClose: () => void
  onSave: (input: BrandFormInput) => void
}

function emptyBrand(): Omit<BrandFormInput, 'id'> {
  return {
    name: '',
    active: true,
    pocName: '',
    pocPhone: '',
    dealerNumber: '',
    dealerEmail: '',
    gstin: '',
    territory: '',
    creditTerms: '',
  }
}

function brandToForm(editing: InventoryBrand): Omit<BrandFormInput, 'id'> {
  return {
    name: editing.name,
    active: editing.active,
    pocName: editing.pocName ?? '',
    pocPhone: editing.pocPhone ?? '',
    dealerNumber: editing.dealerNumber ?? '',
    dealerEmail: editing.dealerEmail ?? '',
    gstin: editing.gstin ?? '',
    territory: editing.territory ?? '',
    creditTerms: editing.creditTerms ?? '',
  }
}

export function BrandFormModal({ open, editing, onClose, onSave }: BrandFormModalProps) {
  const [form, setForm] = useState(emptyBrand)

  useEffect(() => {
    if (!open) return
    setForm(editing ? brandToForm(editing) : emptyBrand())
  }, [open, editing])

  useBodyScrollLock(open)

  if (!open) return null

  const patch = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((p) => ({ ...p, [key]: value }))
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      id: editing?.id,
      ...form,
      name: form.name,
    })
    onClose()
  }

  return (
    <div className="confirm-backdrop" role="presentation">
      <div
        className="support-dialog stock-form-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="brand-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="stock-form-dialog-head">
          <div>
            <h2 id="brand-form-title" className="stock-form-dialog-title">
              {editing ? 'Edit brand' : 'Add brand'}
            </h2>
            <p className="stock-form-dialog-sub">
              Supplier identity for Add stock. POC and dealer details are for your team only.
            </p>
          </div>
          <button type="button" className="stocks-trade-close" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form className="stock-form" onSubmit={submit}>
          <div className="stock-form-scroll">
            <section className="stock-form-section">
              <h3 className="stock-form-section-title">Brand</h3>
              <label className="stock-form-field stock-form-field--full">
                <span className="stock-form-label">Brand name *</span>
                <input
                  className="stock-form-input"
                  value={form.name}
                  onChange={(e) => patch('name', e.target.value)}
                  autoFocus
                  required
                />
              </label>
              <CatalogItemActiveToggle active={form.active} onChange={(v) => patch('active', v)} />
            </section>

            <section className="stock-form-section">
              <h3 className="stock-form-section-title">Dealer contact</h3>
              <div className="stock-form-grid">
                <label className="stock-form-field">
                  <span className="stock-form-label">POC name</span>
                  <input
                    className="stock-form-input"
                    value={form.pocName}
                    onChange={(e) => patch('pocName', e.target.value)}
                    placeholder="Representative at supplier"
                  />
                </label>
                <label className="stock-form-field">
                  <span className="stock-form-label">POC phone</span>
                  <input
                    className="stock-form-input"
                    value={form.pocPhone}
                    onChange={(e) => patch('pocPhone', e.target.value)}
                    placeholder="+91 …"
                    inputMode="tel"
                  />
                </label>
                <label className="stock-form-field">
                  <span className="stock-form-label">Dealer number</span>
                  <input
                    className="stock-form-input"
                    value={form.dealerNumber}
                    onChange={(e) => patch('dealerNumber', e.target.value)}
                    placeholder="AP-TN-8842"
                  />
                </label>
                <label className="stock-form-field">
                  <span className="stock-form-label">Dealer email</span>
                  <input
                    className="stock-form-input"
                    type="email"
                    value={form.dealerEmail}
                    onChange={(e) => patch('dealerEmail', e.target.value)}
                    placeholder="optional"
                  />
                </label>
              </div>
            </section>

            <section className="stock-form-section">
              <h3 className="stock-form-section-title">Accounts & territory</h3>
              <div className="stock-form-grid">
                <label className="stock-form-field">
                  <span className="stock-form-label">GSTIN</span>
                  <input
                    className="stock-form-input uppercase"
                    value={form.gstin}
                    onChange={(e) => patch('gstin', e.target.value.toUpperCase())}
                    placeholder="15-character GSTIN"
                    maxLength={15}
                    autoComplete="off"
                  />
                </label>
                <label className="stock-form-field">
                  <span className="stock-form-label">Credit terms</span>
                  <input
                    className="stock-form-input"
                    value={form.creditTerms}
                    onChange={(e) => patch('creditTerms', e.target.value)}
                    placeholder="Net 30, COD, …"
                  />
                </label>
                <label className="stock-form-field stock-form-field--full">
                  <span className="stock-form-label">Territory</span>
                  <input
                    className="stock-form-input"
                    value={form.territory}
                    onChange={(e) => patch('territory', e.target.value)}
                    placeholder="Town, district or beat"
                  />
                </label>
              </div>
            </section>
          </div>

          <footer className="stock-form-foot">
            <button type="button" className="btn-secondary !h-10 px-5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary !h-10 px-5 text-sm">
              Save brand
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}