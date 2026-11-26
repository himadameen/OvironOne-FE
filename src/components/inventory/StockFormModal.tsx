import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { PackagePlus, PackageSearch, Pencil, Search, X } from 'lucide-react'
import { ShadeColorPicker } from '@/components/inventory/ShadeColorPicker'
import { StockFormProductCard } from '@/components/inventory/StockFormProductCard'
import { CategoryKindStockGuide } from '@/components/inventory/CategoryKindStockGuide'
import { categoryTrackExpiry, unitsForCategoryKind, CATEGORY_KIND_CONFIG } from '@/inventory/category-kind-config'
import { searchCatalogVariants, categoryNeedsShade } from '@/inventory/catalog-search'
import { StockFormReceiveSkuPicker } from '@/components/inventory/StockFormReceiveSkuPicker'
import { listProductTemplates, variantsForProductLine } from '@/inventory/product-templates'
import { parseStockForm, type StockFormValues } from '@/inventory/stock-form-schema'
import { branchesForShop } from '@/data/mock-branches'
import type { DisplayUnit, InventoryBrand, InventoryCategory, ProductVariant } from '@/inventory/types'
import { useBodyScrollLock } from '@/hooks/use-body-scroll-lock'
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

type FormMode = 'receive' | 'create' | 'edit' | 'idle'
type AddStockPath = 'receive' | 'new'

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

function StockFormStep({
  step,
  title,
  hint,
  children,
}: {
  step: number
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <section className="stock-form-step" aria-labelledby={`stock-form-step-${step}-title`}>
      <header className="stock-form-step-head">
        <span className="stock-form-step-num" aria-hidden>
          {step}
        </span>
        <div>
          <h3 id={`stock-form-step-${step}-title`} className="stock-form-step-title">
            {title}
          </h3>
          {hint ? <p className="stock-form-step-hint">{hint}</p> : null}
        </div>
      </header>
      <div className="stock-form-step-body">{children}</div>
    </section>
  )
}

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
  const [addPath, setAddPath] = useState<AddStockPath>('receive')
  const [skuPickCandidates, setSkuPickCandidates] = useState<ProductVariant[] | null>(null)
  const [skuPickSelectedId, setSkuPickSelectedId] = useState<string | null>(null)
  const branches = branchesForShop(shopId)

  const activeBrands = useMemo(() => brands.filter((b) => b.active), [brands])
  const activeCategories = useMemo(() => categories.filter((c) => c.active), [categories])
  const selectedCategory = activeCategories.find((c) => c.id === form.categoryId) ?? null
  const needsShade = selectedCategory ? categoryNeedsShade(selectedCategory.kind) : true
  const trackExpiry = selectedCategory ? categoryTrackExpiry(selectedCategory) : true
  const unitOptions: DisplayUnit[] = selectedCategory
    ? unitsForCategoryKind(selectedCategory.kind)
    : ['L', 'ml', 'kg', 'g', 'nos']
  const variantLabel = selectedCategory
    ? CATEGORY_KIND_CONFIG[selectedCategory.kind].variantLabel
    : undefined

  const searchHits = useMemo(
    () => searchCatalogVariants(variants, shopId, catalogQuery),
    [variants, shopId, catalogQuery]
  )

  const productTemplates = useMemo(() => listProductTemplates(variants, shopId, 16), [variants, shopId])

  const receiveProductLines = useMemo(() => {
    const q = catalogQuery.trim().toLowerCase()
    if (!q) return productTemplates
    return productTemplates.filter(
      (t) => t.productName.toLowerCase().includes(q) || t.brand.toLowerCase().includes(q)
    )
  }, [productTemplates, catalogQuery])

  const pickedVariant = form.receiveFromVariantId
    ? variants.find((v) => v.id === form.receiveFromVariantId)
    : undefined

  const receiveMode = Boolean(form.receiveFromVariantId) && !editing
  const formMode: FormMode = editing ? 'edit' : receiveMode ? 'receive' : flow === 'new' ? 'create' : 'idle'

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
      setAddPath('receive')
      setCatalogQuery('')
      setSkuPickCandidates(null)
      setSkuPickSelectedId(null)
      setForm(emptyForm(activeBrands, activeCategories))
    }
    setErrors({})
  }, [open, editing, brands, activeBrands, activeCategories])

  useBodyScrollLock(open)

  if (!open) return null

  const pickVariant = (variantId: string) => {
    setSkuPickCandidates(null)
    setSkuPickSelectedId(null)
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

  const beginReceiveProductLine = (productId: string) => {
    const skus = variantsForProductLine(variants, shopId, productId)
    if (skus.length === 0) return
    if (skus.length === 1) {
      pickVariant(skus[0].id)
      return
    }
    setSkuPickCandidates(skus)
    setSkuPickSelectedId(skus[0].id)
  }

  const beginReceiveFromSearchHit = (variantId: string) => {
    const v = variants.find((x) => x.id === variantId)
    if (!v) return
    const siblings = variantsForProductLine(variants, shopId, v.productId)
    if (siblings.length > 1) {
      setSkuPickCandidates(siblings)
      setSkuPickSelectedId(variantId)
      return
    }
    pickVariant(variantId)
  }

  const confirmSkuPick = () => {
    if (!skuPickSelectedId) return
    pickVariant(skuPickSelectedId)
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

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const parsed = parseStockForm(form, selectedCategory?.kind ?? null, trackExpiry)
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
      const cfg = CATEGORY_KIND_CONFIG[cat.kind]
      patch('defaultDisplayUnit', cat.defaultDisplayUnit)
      const pack = cat.defaultPackLabel ?? cfg.defaultPackLabel
      if (pack) patch('packLabel', pack)
      if (!categoryNeedsShade(cat.kind)) {
        patch('shadeName', '—')
        patch('shadeHex', '#D8D2C8')
      }
      if (!categoryTrackExpiry(cat)) {
        patch('expiryDate', '')
      }
    }
  }

  const showProductSteps = formMode === 'edit' || (addPath === 'new' && !editing)
  const showCatalog = !editing && addPath === 'receive' && !receiveMode
  const footerHint =
    formMode === 'receive'
      ? 'Adds qty to the existing SKU at this branch.'
      : formMode === 'edit'
        ? `Updates catalogue for ${editing?.sku ?? 'this line'}.`
        : formMode === 'create'
          ? 'Creates a new SKU in your catalog.'
          : addPath === 'receive'
            ? 'Find a product line, pick the SKU, then enter receive details.'
            : 'Fill in the steps below to register a new SKU.'

  const submitLabel =
    formMode === 'receive' ? 'Receive stock' : formMode === 'edit' ? 'Save changes' : 'Add stock'

  const canSubmit = formMode === 'receive' || (addPath === 'new' && !editing) || formMode === 'edit'

  return (
    <div className="confirm-backdrop" role="presentation">
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
              {formMode === 'edit' ? 'Edit stock' : 'Add stock'}
            </h2>
            <p className="stock-form-dialog-sub">
              {formMode === 'edit'
                ? 'Update product details, pack, and default prices.'
                : formMode === 'receive'
                  ? 'Receive more on an existing product — only qty, branch, and cost fields.'
                  : formMode === 'create'
                    ? 'Three steps: product → variant → qty & pricing.'
                    : addPath === 'receive'
                      ? 'Find the product line, select the SKU, then enter qty and costs.'
                      : 'Three steps: product → variant → qty & pricing.'}
            </p>
          </div>
          <button type="button" className="stocks-trade-close" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>

        {!editing ? (
          <div className="stock-form-mode-bar" role="tablist" aria-label="Add stock path">
            <button
              type="button"
              role="tab"
              aria-selected={addPath === 'receive'}
              className={cn('stock-form-mode-tab', addPath === 'receive' && 'stock-form-mode-tab--on')}
              onClick={() => {
                setAddPath('receive')
                setFlow('search')
                setSkuPickCandidates(null)
                setSkuPickSelectedId(null)
                patch('receiveFromVariantId', undefined)
              }}
            >
              <PackageSearch className="h-4 w-4 shrink-0" aria-hidden />
              <span>
                <span className="stock-form-mode-tab-label">Receive existing</span>
                <span className="stock-form-mode-tab-hint">More qty on a SKU</span>
              </span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={addPath === 'new'}
              className={cn('stock-form-mode-tab', addPath === 'new' && 'stock-form-mode-tab--on')}
              onClick={() => {
                setAddPath('new')
                setFlow('new')
                patch('receiveFromVariantId', undefined)
                setSkuPickCandidates(null)
                setSkuPickSelectedId(null)
              }}
            >
              <PackagePlus className="h-4 w-4 shrink-0" aria-hidden />
              <span>
                <span className="stock-form-mode-tab-label">New product line</span>
                <span className="stock-form-mode-tab-hint">New shade, pack, or item</span>
              </span>
            </button>
          </div>
        ) : (
          <div className="stock-form-mode-bar stock-form-mode-bar--edit">
            <span className="stock-form-mode-pill">
              <Pencil className="h-3.5 w-3.5" aria-hidden />
              Editing catalogue
            </span>
          </div>
        )}

        <form className="stock-form" onSubmit={submit}>
          <div className="stock-form-scroll">
            {editing ? (
              <StockFormProductCard variant={editing} badge="Current SKU" />
            ) : null}

            {showCatalog ? (
              <section className="stock-form-section stock-form-section--flat">
                <h3 className="stock-form-section-title">Find product line</h3>
                <p className="stock-form-receive-browse-hint">
                  Search by brand or product. If a line has more than one SKU, you will choose the exact shade and pack
                  next.
                </p>
                <label className="stocks-list-search">
                  <Search className="h-4 w-4 text-muted" aria-hidden />
                  <input
                    type="search"
                    placeholder="e.g. Asian Paints, shade, SKU…"
                    value={catalogQuery}
                    onChange={(e) => {
                      setCatalogQuery(e.target.value)
                      setSkuPickCandidates(null)
                    }}
                  />
                </label>
                {skuPickCandidates && skuPickCandidates.length > 0 ? (
                  <StockFormReceiveSkuPicker
                    productName={skuPickCandidates[0].productName}
                    brand={skuPickCandidates[0].brand}
                    candidates={skuPickCandidates}
                    selectedId={skuPickSelectedId}
                    onSelect={setSkuPickSelectedId}
                    onConfirm={confirmSkuPick}
                    onBack={() => {
                      setSkuPickCandidates(null)
                      setSkuPickSelectedId(null)
                    }}
                  />
                ) : catalogQuery.trim() && searchHits.length > 0 ? (
                  <ul className="stock-form-search-hits">
                    {searchHits.map((hit) => (
                      <li key={hit.variantId}>
                        <button
                          type="button"
                          className="stock-form-hit"
                          onClick={() => beginReceiveFromSearchHit(hit.variantId)}
                        >
                          <span className="stock-form-hit-row">
                            <span className="stock-form-hit-label">{hit.label}</span>
                            <span className="stock-form-hit-badge">Select</span>
                          </span>
                          <span className="stock-form-hit-sub">{hit.sublabel}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : receiveProductLines.length > 0 ? (
                  <div className="stock-form-templates">
                    <p className="stock-form-templates-label">Product lines in catalog</p>
                    <ul className="stock-form-template-grid">
                      {receiveProductLines.map((t) => (
                        <li key={t.productId}>
                          <button
                            type="button"
                            className="stock-form-template-card"
                            onClick={() => beginReceiveProductLine(t.productId)}
                          >
                            <span className="stock-form-template-name">{t.productName}</span>
                            <span className="stock-form-template-meta">
                              {t.brand} ·{' '}
                              <strong className="tabular-nums">
                                {t.variantCount} SKU{t.variantCount === 1 ? '' : 's'}
                              </strong>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : catalogQuery.trim() ? (
                  <p className="stock-form-search-empty">No match — check spelling or add a new product line.</p>
                ) : (
                  <p className="stock-form-idle-hint">Type a brand or product name, or pick a line below.</p>
                )}
              </section>
            ) : null}

            {receiveMode && pickedVariant ? (
              <>
                <StockFormProductCard variant={pickedVariant} badge="Receive" />
                <button
                  type="button"
                  className="stock-form-clear-pick"
                onClick={() => {
                  patch('receiveFromVariantId', undefined)
                  setSkuPickCandidates(null)
                  setSkuPickSelectedId(null)
                }}
              >
                Choose a different SKU
              </button>
                <StockFormStep
                  step={1}
                  title="Receive into branch"
                  hint="Only these fields change stock — product details stay on the SKU above."
                >
                  <ReceiveScopeNote trackExpiry={trackExpiry} />
                  <ReceiveFields
                    form={form}
                    errors={errors}
                    branches={branches}
                    patch={patch}
                    showExpiry={trackExpiry}
                    unitOptions={unitOptions}
                    mode="receive"
                  />
                </StockFormStep>
              </>
            ) : null}

            {showProductSteps ? (
              <>
                <StockFormStep
                  step={1}
                  title="Product"
                  hint="Name, brand, and category — sets which fields appear next."
                >
                  {formMode === 'create' && productTemplates.length > 0 ? (
                    <div className="stock-form-templates stock-form-templates--inline">
                      <p className="stock-form-templates-label">Quick fill from an existing product</p>
                      <ul className="stock-form-template-grid stock-form-template-grid--scroll">
                        {productTemplates.slice(0, 4).map((t) => (
                          <li key={t.productId}>
                            <button
                              type="button"
                              className="stock-form-template-card"
                              onClick={() => pickProductTemplate(t.sampleVariantId)}
                            >
                              <span className="stock-form-template-name">{t.productName}</span>
                              <span className="stock-form-template-meta">{t.brand}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <div className="stock-form-grid">
                    <FormField className="stock-form-field--full" label="Product name" error={errors.productName} required>
                      <input
                        className="stock-form-input"
                        value={form.productName}
                        onChange={(e) => patch('productName', e.target.value)}
                        placeholder="e.g. Apex Ultima Protek"
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
                      <select
                        className="stock-form-input"
                        value={form.categoryId}
                        onChange={(e) => onCategoryChange(e.target.value)}
                      >
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
                  {selectedCategory ? (
                    <CategoryKindStockGuide
                      kind={selectedCategory.kind}
                      config={CATEGORY_KIND_CONFIG[selectedCategory.kind]}
                      variant="compact"
                      className="stock-form-category-guide"
                    />
                  ) : null}
                </StockFormStep>

                <StockFormStep
                  step={2}
                  title={needsShade ? 'Shade, colour & pack' : 'Variant & pack'}
                  hint={
                    needsShade
                      ? 'Required for paint categories.'
                      : 'Optional size label and pack for this SKU.'
                  }
                >
                  {needsShade ? (
                    <>
                      <ShadeColorPicker
                        shadeName={form.shadeName ?? ''}
                        shadeHex={form.shadeHex ?? '#E8E2D4'}
                        onShadeNameChange={(v) => patch('shadeName', v)}
                        onShadeHexChange={(v) => patch('shadeHex', v)}
                        error={errors.shadeName ?? errors.shadeHex}
                      />
                      <FormField className="stock-form-field--full" label="Pack size" error={errors.packLabel} required>
                        <input
                          className="stock-form-input"
                          value={form.packLabel}
                          onChange={(e) => patch('packLabel', e.target.value)}
                          placeholder="e.g. 1 L or 20 L"
                        />
                      </FormField>
                    </>
                  ) : (
                    <div className="stock-form-grid">
                      <FormField label={variantLabel ?? 'Label (optional)'} error={errors.shadeName}>
                        <input
                          className="stock-form-input"
                          value={form.shadeName === '—' ? '' : (form.shadeName ?? '')}
                          onChange={(e) => patch('shadeName', e.target.value || '—')}
                          placeholder="e.g. 9 inch roller"
                        />
                      </FormField>
                      <FormField label="Pack" error={errors.packLabel} required>
                        <input
                          className="stock-form-input"
                          value={form.packLabel}
                          onChange={(e) => patch('packLabel', e.target.value)}
                        />
                      </FormField>
                    </div>
                  )}
                </StockFormStep>

                <StockFormStep
                  step={3}
                  title={formMode === 'edit' ? 'Branch & default pricing' : 'First receive'}
                  hint={
                    formMode === 'edit'
                      ? 'Branch, list costs, and unit — does not change on-hand qty here.'
                      : 'Branch, qty, purchase & selling price for this intake.'
                  }
                >
                  <ReceiveFields
                    form={form}
                    errors={errors}
                    branches={branches}
                    patch={patch}
                    showExpiry={trackExpiry}
                    unitOptions={unitOptions}
                    mode={formMode === 'edit' ? 'edit' : 'create'}
                  />
                </StockFormStep>
              </>
            ) : null}

            {addPath === 'receive' &&
            !receiveMode &&
            !skuPickCandidates &&
            !catalogQuery.trim() &&
            productTemplates.length === 0 ? (
              <div className="stock-form-idle-panel">
                <PackageSearch className="h-8 w-8 text-muted" strokeWidth={1.5} />
                <p className="stock-form-idle-title">Choose how to add stock</p>
                <p className="stock-form-idle-hint">
                  Use the tabs above to <strong>receive</strong> on an existing line or open{' '}
                  <strong>New product line</strong>.
                </p>
              </div>
            ) : null}
          </div>

          <footer className="stock-form-foot">
            <p className="stock-form-foot-hint">{footerHint}</p>
            <div className="stock-form-foot-actions">
              <button type="button" className="btn-secondary !h-10 px-5 text-sm" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary !h-10 px-5 text-sm" disabled={!canSubmit}>
                {submitLabel}
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  )
}

function ReceiveScopeNote({ trackExpiry }: { trackExpiry: boolean }) {
  return (
    <div className="stock-form-receive-scope" role="note">
      <p className="stock-form-receive-scope-title">You update on receive</p>
      <ul className="stock-form-receive-scope-list">
        <li>Branch, quantity, purchase & selling cost</li>
        {trackExpiry ? <li>Expiry date for this batch</li> : <li>No expiry field (category setting)</li>}
      </ul>
      <p className="stock-form-receive-scope-muted">Name, shade, pack, and SKU stay unchanged.</p>
    </div>
  )
}

function ReceiveFields({
  form,
  errors,
  branches,
  patch,
  showExpiry,
  unitOptions,
  mode,
}: {
  form: StockFormValues
  errors: Record<string, string>
  branches: ReturnType<typeof branchesForShop>
  patch: <K extends keyof StockFormValues>(key: K, value: StockFormValues[K]) => void
  showExpiry: boolean
  unitOptions: DisplayUnit[]
  mode: 'receive' | 'create' | 'edit'
}) {
  const showQty = mode !== 'edit'

  return (
    <div className="stock-form-receive-groups">
      <div className="stock-form-subsection">
        <p className="stock-form-subsection-title">Location</p>
        <FormField className="stock-form-field--full" label="Branch" error={errors.branchId} required>
          <select className="stock-form-input" value={form.branchId} onChange={(e) => patch('branchId', e.target.value)}>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {showQty ? (
        <div className="stock-form-subsection">
          <p className="stock-form-subsection-title">Quantity</p>
          <div className="stock-form-grid">
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
                {unitOptions.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </div>
      ) : (
        <div className="stock-form-subsection">
          <p className="stock-form-subsection-title">Unit</p>
          <FormField label="Stock unit" error={errors.defaultDisplayUnit}>
            <select
              className="stock-form-input"
              value={form.defaultDisplayUnit}
              onChange={(e) => patch('defaultDisplayUnit', e.target.value as StockFormValues['defaultDisplayUnit'])}
            >
              {unitOptions.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      )}

      <div className="stock-form-subsection">
        <p className="stock-form-subsection-title">Costs (₹ per unit above)</p>
        <div className="stock-form-grid">
          <FormField label="Purchase" error={errors.purchaseCost}>
            <input
              type="number"
              min={0}
              step={0.01}
              className="stock-form-input tabular-nums"
              value={form.purchaseCost}
              onChange={(e) => patch('purchaseCost', Number(e.target.value))}
            />
          </FormField>
          <FormField label="Selling" error={errors.sellingCost}>
            <input
              type="number"
              min={0}
              step={0.01}
              className="stock-form-input tabular-nums"
              value={form.sellingCost}
              onChange={(e) => patch('sellingCost', Number(e.target.value))}
            />
          </FormField>
        </div>
      </div>

      {showExpiry ? (
        <div className="stock-form-subsection">
          <p className="stock-form-subsection-title">Shelf life</p>
          <FormField className="stock-form-field--full" label="Expiry date" error={errors.expiryDate} required>
            <input
              type="date"
              className="stock-form-input"
              value={form.expiryDate ?? ''}
              onChange={(e) => patch('expiryDate', e.target.value)}
            />
          </FormField>
        </div>
      ) : mode !== 'edit' ? (
        <p className="stock-form-subsection-note">Expiry not required for this category.</p>
      ) : null}
    </div>
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
  children: ReactNode
}) {
  return (
    <label className={cn('stock-form-field', className)}>
      <span className="stock-form-label">
        {label}
        {required ? (
          <span className="stock-form-required" aria-hidden>
            {' '}
            *
          </span>
        ) : null}
      </span>
      {children}
      {error ? <span className="stock-form-error">{error}</span> : null}
    </label>
  )
}