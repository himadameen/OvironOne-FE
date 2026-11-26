import { ShadeSwatch } from '@/components/inventory/ShadeSwatch'
import type { ProductVariant } from '@/inventory/types'

export function StockFormProductCard({ variant, badge }: { variant: ProductVariant; badge: string }) {
  return (
    <div className="stock-form-product-card">
      <div className="stock-form-product-card-main">
        <ShadeSwatch hex={variant.shadeHex} shadeName={variant.shadeName} />
        <div className="stock-form-product-card-text">
          <p className="stock-form-product-card-name">{variant.productName}</p>
          <p className="stock-form-product-card-meta">
            {variant.brand} · {variant.shadeName} · {variant.packLabel}
          </p>
          <p className="stock-form-product-card-sku tabular-nums">{variant.sku}</p>
        </div>
      </div>
      <span className="stock-form-product-card-badge">{badge}</span>
    </div>
  )
}