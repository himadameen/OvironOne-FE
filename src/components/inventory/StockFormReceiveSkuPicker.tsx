import { Check } from 'lucide-react'
import type { ProductVariant } from '@/inventory/types'
import { ShadeSwatch } from '@/components/inventory/ShadeSwatch'
import { cn } from '@/lib/utils'

interface StockFormReceiveSkuPickerProps {
  productName: string
  brand: string
  candidates: ProductVariant[]
  selectedId: string | null
  onSelect: (variantId: string) => void
  onConfirm: () => void
  onBack: () => void
}

export function StockFormReceiveSkuPicker({
  productName,
  brand,
  candidates,
  selectedId,
  onSelect,
  onConfirm,
  onBack,
}: StockFormReceiveSkuPickerProps) {
  return (
    <div className="stock-form-sku-pick">
      <div className="stock-form-sku-pick-head">
        <p className="stock-form-sku-pick-kicker">Select SKU</p>
        <h4 className="stock-form-sku-pick-title">
          {productName}
          <span className="stock-form-sku-pick-brand"> · {brand}</span>
        </h4>
        <p className="stock-form-sku-pick-hint">
          {candidates.length} lines — choose the exact shade, pack, and SKU to receive.
        </p>
      </div>

      <ul className="stock-form-sku-pick-list" role="listbox" aria-label="SKUs to receive">
        {candidates.map((v) => {
          const on = selectedId === v.id
          return (
            <li key={v.id}>
              <button
                type="button"
                role="option"
                aria-selected={on}
                className={cn('stock-form-sku-pick-row', on && 'stock-form-sku-pick-row--on')}
                onClick={() => onSelect(v.id)}
              >
                <ShadeSwatch hex={v.shadeHex} shadeName={v.shadeName} />
                <span className="stock-form-sku-pick-row-text">
                  <span className="stock-form-sku-pick-row-line">
                    {v.shadeName} · {v.packLabel}
                  </span>
                  <span className="stock-form-sku-pick-row-sub">
                    <span className="tabular-nums">{v.sku}</span>
                    <span aria-hidden> · </span>
                    {v.warehouseName}
                  </span>
                </span>
                {on ? <Check className="stock-form-sku-pick-check h-4 w-4" aria-hidden /> : null}
              </button>
            </li>
          )
        })}
      </ul>

      <div className="stock-form-sku-pick-actions">
        <button type="button" className="btn-secondary !h-9 px-4 text-sm" onClick={onBack}>
          Back
        </button>
        <button
          type="button"
          className="btn-primary !h-9 px-4 text-sm"
          disabled={!selectedId}
          onClick={onConfirm}
        >
          Continue — receive this SKU
        </button>
      </div>
    </div>
  )
}