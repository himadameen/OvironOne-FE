import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { ShadeColorPicker } from '@/components/inventory/ShadeColorPicker'
import { searchCatalogVariants, categoryNeedsShade } from '@/inventory/catalog-search'
import { listProductTemplates } from '@/inventory/product-templates'
import { parseStockForm, type StockFormValues } from '@/inventory/stock-form-schema'
import { branchesForShop } from '@/data/mock-branches'
import type { InventoryBrand, InventoryCategory, ProductVariant } from '@/inventory/types'
import { cn } from '@/lib/utils'

interface StockFormModalProps {
  open: boolean
  shopId: string
  brands: InventoryBrand[]
  categories: InventoryCategory[]
  variants: ProductVariant[]
  editing?: ProductVariant | null
  onClose: () => void
  onSave: (values: StockFormValues, editId?: string) => void
}

const emptyForm = (brands: InventoryBrand[], categories: InventoryCategory[]): StockFormValues => ({
  receiveFromVariantId: undefined,
  brandId: brands.find((b) => b.active)?.id ?? '',
  productName: '',
  categoryId: categories.find((c) => c.active)?.id ?? '',
  shadeName: '',
  shadeHex: '#E8E2D4',
  packLabel: '1 L',
  branchId: 'branch-ambur-main',
  purchaseCost: 0,
  sellingCost: 0,
  qty: 1,
  defaultDisplayUnit: 'L',
  expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
})

export function StockFormModal({
  open,
  shopId,
  brands,
  categories,
  variants,
  editing,
  onClose,
  onSave,
}: StockFormModalProps) {
  const [form, setForm] = useState<StockFormValues>(() => emptyForm(brands, categories))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [catalogQuery, setCatalogQuery] = useState('')
  const [flow, setFlow] = useState<'search' | 'new'>('search')
  const branches = branchesForShop(shopId)

  const activeBrands = useMemo(() => brands.filter((b) => b.active), [brands])
  const activeCategories = useMemo(() => categories.filter((c) => c.active), [categories])
  const selectedCategory = activeCategories.find((c) => c.id === form.categoryId) ?? null
  const needsShade = selectedCategory ? categoryNeedsShade(selectedCategory.kind) : true

  const searchHits = useMemo(
    () => searchCatalogVariants(variants, shopId, catalogQuery),
    [variants, shopId, catalogQuery]
  )

  const productTemplates = useMemo(
    () => listProductTemplates(variants, shopId, 6),
    [variants, shopId]
  )

  const pickedVariant = form.receiveFromVariantId
    ? variants.find((v) => v.id === form.receiveFromVariantId)
    : undefined

  useEffect(() => {
    if (!open) return
    if (editing) {
      const purchase =
        editing.baseKind === 'volume' && editing.defaultDisplayUnit === 'L'
          ? editing.purchaseCostPerBase * 1000
          : editing.baseKind === 'mass' && editing.defaultDisplayUnit === 'kg'
            ? editing.purchaseCostPerBase * 1000
            : editing.purchaseCostPerBase
      const selling =
        editing.baseKind === 'volume' && editing.defaultDisplayUnit === 'L'
          ? editing.sellingCostPerBase * 1000
          : editing.baseKind === 'mass' && editing.defaultDisplayUnit === 'kg'
            ? editing.sellingCostPerBase * 1000
            : editing.sellingCostPerBase
      const branchId =
        editing.warehouseId === 'wh-yard' ? 'branch-ambur-yard' : 'branch-ambur-main'
      const brandId = brands.find((b) => b.name === editing.brand)?.id ?? activeBrands[0]?.id ?? ''
      setFlow('new')
      setForm({
        receiveFromVariantId: undefined,
        brandId,
        productName: editing.productName,
        categoryId: editing.categoryId,
        shadeName: editing.shadeName,
        shadeHex: editing.shadeHex,
        packLabel: editing.packLabel,
        branchId,
        purchaseCost: purchase,
        sellingCost: selling,
        qty: 1,
        defaultDisplayUnit: editing.defaultDisplayUnit,
        expiryDate: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
      })
    } else {
      setFlow('search')
      setCatalogQuery('')
      setForm(emptyForm(activeBrands, activeCategories))
    }
    setErrors({})
  }, [open, editing, brands, activeBrands, activeCategories])

  if (!open) return null

  const pickVariant = (variantId: string) => {
    const v = variants.find((x) => x.id === variantId)
    if (!v) return
    const brandId = brands.find((b) => b.name === v.brand)?.id ?? form.brandId
    const purchase =
      v.baseKind === 'volume' && v.defaultDisplayUnit === 'L'
        ? v.purchaseCostPerBase * 1000
        : v.baseKind === 'mass' && v.defaultDisplayUnit === 'kg'
          ? v.purchaseCostPerBase * 1000
          : v.purchaseCostPerBase
    const selling =
      v.baseKind === 'volume' && v.defaultDisplayUnit === 'L'
        ? v.sellingCostPerBase * 1000
        : v.baseKind === 'mass' && v.defaultDisplayUnit === 'kg'
          ? v.sellingCostPerBase * 1000
          : v.sellingCostPerBase
    setForm((p) => ({
      ...p,
      receiveFromVariantId: variantId,
      brandId,
      productName: v.productName,
      categoryId: v.categoryId,
      shadeName: v.shadeName,
      shadeHex: v.shadeHex,
      packLabel: v.packLabel,
      purchaseCost: purchase,
      sellingCost: selling,
      defaultDisplayUnit: v.defaultDisplayUnit,
      qty: 1,
    }))
    setFlow('search')
  }

  const pickProductTemplate = (sampleVariantId: string) => {
    const v = variants.find((x) => x.id === sampleVariantId)
    if (!v) return
    const brandId = brands.find((b) => b.name === v.brand || b.id === v.brandId)?.id ?? ''
    const purchase =
      v.baseKind === 'volume' && v.defaultDisplayUnit === 'L'
        ? v.purchaseCostPerBase * 1000
        : v.baseKind === 'mass' && v.defaultDisplayUnit === 'kg'
          ? v.purchaseCostPerBase * 1000
          : v.purchaseCostPerBase
    const selling =
      v.baseKind === 'volume' && v.defaultDisplayUnit === 'L'
        ? v.sellingCostPerBase * 1000
        : v.baseKind === 'mass' && v.defaultDisplayUnit === 'kg'
          ? v.sellingCostPerBase * 1000
          : v.sellingCostPerBase
    setFlow('new')
    setForm((p) => ({
      ...p,
      receiveFromVariantId: undefined,
      brandId,
      productName: v.productName,
      categoryId: v.categoryId,
      shadeName: categoryNeedsShade(
        activeCategories.find((c) => c.id === v.categoryId)?.kind ?? 'paint'
      )
        ? ''
        : '—',
      shadeHex: '#E8E2D4',
      packLabel: v.packLabel,
      purchaseCost: purchase,
      sellingCost: selling,
      defaultDisplayUnit: v.defaultDisplayUnit,
      qty: 1,
    }))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = parseStockForm(form, selectedCategory?.kind ?? null)
    if (!parsed.success) {
      const next: Record<string, string> = {}
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? 'form')
        next[key] = issue.message
      }
      setErrors(next)
      return
    }
    onSave(parsed.data, editing?.id)
    onClose()
  }

  const patch = <K extends keyof StockFormValues>(key: K, value: StockFormValues[K]) => {
    setForm((p) => ({ ...p, [key]: value }))
    setErrors((prev) => {
      if (!prev[key as string]) return prev
      const next = { ...prev }
      delete next[key as string]
      return next
    })
  }

  const onCategoryChange = (categoryId: string) => {
    const cat = activeCategories.find((c) => c.id === categoryId)
    patch('categoryId', categoryId)
    if (cat) {
      patch('defaultDisplayUnit', cat.defaultDisplayUnit)
      if (!categoryNeedsShade(cat.kind)) {
        patch('shadeName', '—')
        patch('shadeHex', '#D8D2C8')
      }
    }
  }

  const receiveMode = Boolean(form.receiveFromVariantId) && !editing

  return (
    <div className="confirm-backdrop" role="presentation" onClick={onClose}>
      <div
        className="support-dialog stock-form-dialog stock-form-dialog--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stock-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="stock-form-dialog-head">
          <div>
            <h2 id="stock-form-title" className="stock-form-dialog-title">
              {editing ? 'Edit stock' : 'Add stock'}
            </h2>
            <p className="stock-form-dialog-sub">
              {editing
                ? 'Update product details for this SKU.'
                : 'Search your catalog first — receive on an existing line or add a new product.'}
            </p>
          </div>
          <button type="button" className="stocks-trade-close" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form className="stock-form" onSubmit={submit}>
          <div className="stock-form-scroll">
            {!editing ? (
              <section className="stock-form-section">
                <h3 className="stock-form-section-title">Find in catalog</h3>
                <label className="stock-form-search">
                  <Search className="h-4 w-4 text-muted" aria-hidden />
                  <input
                    type="search"
                    className="stock-form-input"
                    placeholder="Product, brand, shade, SKU…"
                    value={catalogQuery}
                    onChange={(e) => setCatalogQuery(e.target.value)}
                  />
                </label>
                {catalogQuery.trim() && searchHits.length > 0 ? (
                  <ul className="stock-form-search-hits">
                    {searchHits.map((hit) => (
                      <li key={hit.variantId}>
                        <button type="button" className="stock-form-hit" onClick={() => pickVariant(hit.variantId)}>
                          <span className="stock-form-hit-row">
                            <span className="stock-form-hit-label">{hit.label}</span>
                            <span className="stock-form-hit-badge">Receive</span>
                          </span>
                          <span className="stock-form-hit-sub">{hit.sublabel}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : catalogQuery.trim() ? (
                  <p className="stock-form-search-empty">No match — try a product template or add new line.</p>
                ) : productTemplates.length > 0 ? (
                  <div className="stock-form-templates">
                    <p className="stock-form-templates-label">Quick pick — new shade or pack</p>
                    <ul className="stock-form-template-grid">
                      {productTemplates.map((t) => (
                        <li key={t.productId}>
                          <button
                            type="button"
                            className="stock-form-template-card"
                            onClick={() => pickProductTemplate(t.sampleVariantId)}
                          >
                            <span className="stock-form-template-name">{t.productName}</span>
                            <span className="stock-form-template-meta">
                              {t.brand} · {t.variantCount} SKU{t.variantCount === 1 ? '' : 's'}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {receiveMode && pickedVariant ? (
                  <div className="stock-form-picked">
                    <p className="stock-form-picked-title">Receiving stock for</p>
                    <p className="stock-form-picked-line">
                      <strong>{pickedVariant.productName}</strong> · {pickedVariant.brand} · {pickedVariant.shadeName}{' '}
                      · {pickedVariant.packLabel}
                    </p>
                    <button
                      type="button"
                      className="text-xs font-semibold text-brand-primary"
                      onClick={() => patch('receiveFromVariantId', undefined)}
                    >
                      Clear — add different product
                    </button>
                  </div>
                ) : null}

                <div className="stock-form-flow-toggle">
                  <button
                    type="button"
                    className={cn('stock-form-flow-btn', flow === 'search' && !receiveMode && 'stock-form-flow-btn--on')}
                    onClick={() => {
                      setFlow('search')
                      patch('receiveFromVariantId', undefined)
                    }}
                  >
                    Search & receive
                  </button>
                  <button
                    type="button"
                    className={cn('stock-form-flow-btn', flow === 'new' && 'stock-form-flow-btn--on')}
                    onClick={() => {
                      setFlow('new')
                      patch('receiveFromVariantId', undefined)
                    }}
                  >
                    New product line
                  </button>
                </div>
              </section>
            ) : null}

            {receiveMode ? (
              <ReceiveFields form={form} errors={errors} branches={branches} patch={patch} />
            ) : flow === 'new' || editing ? (
              <>
                <section className="stock-form-section">
                  <h3 className="stock-form-section-title">Product</h3>
                  <div className="stock-form-grid">
                    <FormField className="stock-form-field--full" label="Product name" error={errors.productName} required>
                      <input
                        className="stock-form-input"
                        value={form.productName}
                        onChange={(e) => patch('productName', e.target.value)}
                      />
                    </FormField>
                    <FormField label="Brand" error={errors.brandId} required>
                      <select
                        className="stock-form-input"
                        value={form.brandId}
                        onChange={(e) => patch('brandId', e.target.value)}
                      >
                        <option value="">Select…</option>
                        {activeBrands.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Category" error={errors.categoryId} required>
                      <select className="stock-form-input" value={form.categoryId} onChange={(e) => onCategoryChange(e.target.value)}>
                        <option value="">Select…</option>
                        {activeCategories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                  <p className="stock-form-manage-links">
                    <Link to="/admin/inventory/brands">Manage brands</Link>
                    <span aria-hidden> · </span>
                    <Link to="/admin/inventory/categories">Manage categories</Link>
                  </p>
                </section>

                {needsShade ? (
                  <section className="stock-form-section">
                    <h3 className="stock-form-section-title">Shade & colour</h3>
                    <ShadeColorPicker
                      shadeName={form.shadeName ?? ''}
                      shadeHex={form.shadeHex ?? '#E8E2D4'}
                      onShadeNameChange={(v) => patch('shadeName', v)}
                      onShadeHexChange={(v) => patch('shadeHex', v)}
                      error={errors.shadeName ?? errors.shadeHex}
                    />
                  </section>
                ) : (
                  <section className="stock-form-section">
                    <h3 className="stock-form-section-title">Variant</h3>
                    <p className="text-sm text-muted">Shade not required for brushes, tools, and similar items.</p>
                    <div className="stock-form-grid">
                      <FormField label="Label (optional)" error={errors.shadeName}>
                        <input
                          className="stock-form-input"
                          value={form.shadeName === '—' ? '' : (form.shadeName ?? '')}
                          onChange={(e) => patch('shadeName', e.target.value || '—')}
                          placeholder="e.g. 9 inch roller"
                        />
                      </FormField>
                      <FormField label="Pack" error={errors.packLabel} required>
                        <input className="stock-form-input" value={form.packLabel} onChange={(e) => patch('packLabel', e.target.value)} />
                      </FormField>
                    </div>
                  </section>
                )}

                {needsShade ? (
                  <section className="stock-form-section">
                    <h3 className="stock-form-section-title">Pack</h3>
                    <FormField label="Pack size" error={errors.packLabel} required>
                      <input className="stock-form-input" value={form.packLabel} onChange={(e) => patch('packLabel', e.target.value)} />
                    </FormField>
                  </section>
                ) : null}

                <ReceiveFields form={form} errors={errors} branches={branches} patch={patch} />
              </>
            ) : (
              <p className="stock-form-hint">Search above or choose <strong>New product line</strong> to enter details.</p>
            )}
          </div>

          <footer className="stock-form-foot">
            <button type="button" className="btn-secondary !h-10 px-5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary !h-10 px-5 text-sm"
              disabled={!editing && flow === 'search' && !receiveMode}
            >
              {receiveMode ? 'Receive stock' : editing ? 'Save changes' : 'Add stock'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  )
}

function ReceiveFields({
  form,
  errors,
  branches,
  patch,
}: {
  form: StockFormValues
  errors: Record<string, string>
  branches: ReturnType<typeof branchesForShop>
  patch: <K extends keyof StockFormValues>(key: K, value: StockFormValues[K]) => void
}) {
  return (
    <section className="stock-form-section">
      <h3 className="stock-form-section-title">Branch & pricing</h3>
      <div className="stock-form-grid stock-form-grid--triple">
        <FormField className="stock-form-field--full" label="Branch" error={errors.branchId} required>
          <select className="stock-form-input" value={form.branchId} onChange={(e) => patch('branchId', e.target.value)}>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Purchase cost (₹)" error={errors.purchaseCost}>
          <input
            type="number"
            min={0}
            step={0.01}
            className="stock-form-input tabular-nums"
            value={form.purchaseCost}
            onChange={(e) => patch('purchaseCost', Number(e.target.value))}
          />
        </FormField>
        <FormField label="Selling cost (₹)" error={errors.sellingCost}>
          <input
            type="number"
            min={0}
            step={0.01}
            className="stock-form-input tabular-nums"
            value={form.sellingCost}
            onChange={(e) => patch('sellingCost', Number(e.target.value))}
          />
        </FormField>
        <FormField label="Qty" error={errors.qty} required>
          <input
            type="number"
            min={0}
            step={0.01}
            className="stock-form-input tabular-nums"
            value={form.qty}
            onChange={(e) => patch('qty', Number(e.target.value))}
          />
        </FormField>
        <FormField label="Unit" error={errors.defaultDisplayUnit}>
          <select
            className="stock-form-input"
            value={form.defaultDisplayUnit}
            onChange={(e) => patch('defaultDisplayUnit', e.target.value as StockFormValues['defaultDisplayUnit'])}
          >
            <option value="L">L</option>
            <option value="ml">ml</option>
            <option value="kg">kg</option>
            <option value="g">g</option>
            <option value="nos">nos</option>
          </select>
        </FormField>
        <FormField label="Expiry date" error={errors.expiryDate} required>
          <input type="date" className="stock-form-input" value={form.expiryDate} onChange={(e) => patch('expiryDate', e.target.value)} />
        </FormField>
      </div>
    </section>
  )
}

function FormField({
  label,
  error,
  required,
  className,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={cn('stock-form-field', className)}>
      <span className="stock-form-label">
        {label}
        {required ? <span className="stock-form-required" aria-hidden> *</span> : null}
      </span>
      {children}
      {error ? <span className="stock-form-error">{error}</span> : null}
    </label>
  )
}