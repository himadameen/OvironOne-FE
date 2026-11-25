import { useMemo, useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CatalogCrudRow {
  id: string
  name: string
  active: boolean
  meta?: string
}

interface CatalogCrudTableProps {
  title: string
  description: string
  rows: CatalogCrudRow[]
  nameLabel?: string
  metaLabel?: string
  onSave: (input: { id?: string; name: string; active: boolean; meta?: string }) => void
}

export function CatalogCrudTable({
  title,
  description,
  rows,
  nameLabel = 'Name',
  metaLabel,
  onSave,
}: CatalogCrudTableProps) {
  const [showInactive, setShowInactive] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftMeta, setDraftMeta] = useState('')
  const [draftActive, setDraftActive] = useState(true)
  const [adding, setAdding] = useState(false)

  const visible = useMemo(
    () => (showInactive ? rows : rows.filter((r) => r.active)),
    [rows, showInactive]
  )

  const startAdd = () => {
    setAdding(true)
    setEditingId(null)
    setDraftName('')
    setDraftMeta('')
    setDraftActive(true)
  }

  const startEdit = (row: CatalogCrudRow) => {
    setAdding(false)
    setEditingId(row.id)
    setDraftName(row.name)
    setDraftMeta(row.meta ?? '')
    setDraftActive(row.active)
  }

  const cancel = () => {
    setAdding(false)
    setEditingId(null)
  }

  const commit = () => {
    if (!draftName.trim()) return
    onSave({
      id: editingId ?? undefined,
      name: draftName,
      active: draftActive,
      meta: draftMeta || undefined,
    })
    cancel()
  }

  return (
    <section className="catalog-crud card-widget">
      <header className="catalog-crud-head">
        <div>
          <h1 className="catalog-crud-title">{title}</h1>
          <p className="catalog-crud-desc">{description}</p>
        </div>
        <div className="catalog-crud-actions">
          <label className="catalog-crud-toggle">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Show inactive
          </label>
          <button type="button" className="btn-primary !h-9 px-3 text-xs" onClick={startAdd}>
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>
      </header>

      {(adding || editingId) && (
        <div className="catalog-crud-editor">
          <label className="stock-form-field">
            <span className="stock-form-label">{nameLabel}</span>
            <input className="stock-form-input" value={draftName} onChange={(e) => setDraftName(e.target.value)} />
          </label>
          {metaLabel ? (
            <label className="stock-form-field">
              <span className="stock-form-label">{metaLabel}</span>
              <input className="stock-form-input" value={draftMeta} onChange={(e) => setDraftMeta(e.target.value)} />
            </label>
          ) : null}
          <label className="catalog-crud-active">
            <input type="checkbox" checked={draftActive} onChange={(e) => setDraftActive(e.target.checked)} />
            Active in stock forms
          </label>
          <div className="catalog-crud-editor-actions">
            <button type="button" className="btn-primary !h-9 px-4 text-xs" onClick={commit}>
              Save
            </button>
            <button type="button" className="btn-secondary !h-9 px-4 text-xs" onClick={cancel}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="catalog-crud-table-wrap">
        <table className="catalog-crud-table">
          <thead>
            <tr>
              <th>{nameLabel}</th>
              {metaLabel ? <th>{metaLabel}</th> : null}
              <th>Status</th>
              <th className="text-right">Edit</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className={cn(!row.active && 'catalog-crud-row--inactive')}>
                <td>{row.name}</td>
                {metaLabel ? <td className="text-muted text-sm">{row.meta ?? '—'}</td> : null}
                <td>
                  <span className={cn('catalog-crud-status', row.active && 'catalog-crud-status--on')}>
                    {row.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="text-right">
                  <button type="button" className="btn-ghost-light !h-8 !w-8 p-0" onClick={() => startEdit(row)} aria-label="Edit">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
