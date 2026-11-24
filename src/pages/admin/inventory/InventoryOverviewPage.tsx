import { Link } from 'react-router-dom'
import { AlertTriangle, ArrowRightLeft, Package, PackageX, Timer, Wallet } from 'lucide-react'
import { PageShell } from '@/components/PageShell'
import { StatCard } from '@/components/StatCard'
import { ColorSwatchChip } from '@/components/inventory/ColorSwatchChip'
import { MovementTypePill } from '@/components/inventory/MovementTypePill'
import { convertFromBase, formatQty } from '@/inventory/units'
import { useInventoryOverview } from '@/hooks/inventory/use-inventory-overview'
import { useInventoryStore } from '@/stores/inventory-store'
import {
  InventoryPageHeader,
} from '@/pages/admin/inventory/InventoryModuleLayout'
import type { StockQuickFilter } from '@/inventory/types'
import { cn } from '@/lib/utils'

const FILTERS: { id: StockQuickFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'low', label: 'Low' },
  { id: 'expiring', label: 'Expiring' },
  { id: 'expired', label: 'Expired' },
  { id: 'oos', label: 'OOS' },
]

export function InventoryOverviewPage() {
  const { kpis, recentMovements, shopId } = useInventoryOverview()
  const variants = useInventoryStore((s) => s.variants.filter((v) => v.shopId === shopId))

  return (
    <PageShell
      title="Inventory"
      description="Category-based paint stock — purchase cost, selling price, margin, and qty in L, kg, or nos. Batches drive FIFO value."
    >
      <InventoryPageHeader />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total SKUs" value={String(kpis.totalSkus)} icon={Package} />
        <StatCard label="Stock value (FIFO)" value={kpis.stockValueLabel} icon={Wallet} />
        <StatCard label="Low stock" value={String(kpis.lowStock)} icon={AlertTriangle} warning />
        <StatCard label="Expiring 30d" value={String(kpis.expiring30)} icon={Timer} warning />
        <StatCard label="Expired" value={String(kpis.expired)} icon={AlertTriangle} warning />
        <StatCard label="Out of stock" value={String(kpis.oos)} icon={PackageX} warning />
      </section>

      <section className="card-widget mt-6">
        <h2 className="text-h2">Quick filters</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Link
              key={f.id}
              to={`/admin/inventory/variants?status=${f.id}`}
              className="profile-section-chip"
            >
              {f.label}
            </Link>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          Categories:{' '}
          {useInventoryStore
            .getState()
            .categories.filter((c) => c.shopId === shopId)
            .map((c) => c.name)
            .join(' · ')}
        </p>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_auto]">
        <div className="card-widget">
          <h2 className="text-h2">Recent movements</h2>
          <div className="inv-table-scroll mt-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Variant</th>
                  <th>Qty</th>
                  <th>Ref</th>
                </tr>
              </thead>
              <tbody>
                {recentMovements.map((m) => {
                  const variant = variants.find((v) => v.id === m.variantId)
                  if (!variant) return null
                  const displayQty = convertFromBase(
                    Math.abs(m.qtyDeltaBase),
                    variant.defaultDisplayUnit,
                    variant.baseKind,
                    variant.densityKgPerL
                  )
                  const sign = m.qtyDeltaBase >= 0 ? '+' : '−'
                  return (
                    <tr key={m.id}>
                      <td>{new Date(m.at).toLocaleString('en-IN')}</td>
                      <td>
                        <MovementTypePill type={m.type} />
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <ColorSwatchChip hex={variant.shadeHex} />
                          <span className="text-sm">
                            {variant.productName}
                            <span className="block text-xs text-muted">{variant.sku}</span>
                          </span>
                        </div>
                      </td>
                      <td className="font-medium">
                        {sign}
                        {formatQty(displayQty, variant.defaultDisplayUnit)}
                      </td>
                      <td className="text-sm text-muted">{m.reference}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card-widget h-fit lg:min-w-[14rem]">
          <h2 className="text-h2">Quick actions</h2>
          <div className="mt-4 flex flex-col gap-2">
            <Link to="/admin/inventory/adjustments/new" className="btn-secondary text-center">
              New purchase (demo)
            </Link>
            <Link to="/admin/inventory/adjustments/new" className="btn-primary text-center">
              Stock adjustment
            </Link>
            <Link
              to="/admin/inventory/adjustments/new?intent=transfer"
              className={cn('btn-secondary flex items-center justify-center gap-2')}
            >
              <ArrowRightLeft className="h-4 w-4" />
              Transfer
            </Link>
          </div>
          <p className="mt-3 text-xs text-muted">
            Movements are append-only. Purchases will connect to the Purchases module later.
          </p>
        </div>
      </section>
    </PageShell>
  )
}