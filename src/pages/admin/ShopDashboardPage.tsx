import { Package, Receipt, Truck, Users } from 'lucide-react'
import { PageShell } from '@/components/PageShell'
import { StatCard } from '@/components/StatCard'
import { branchesForShop } from '@/data/mock-branches'
import { dashboardSnapshot } from '@/data/mock-dashboard-stats'
import { mockShops } from '@/data/mock-shops'
import { useAuthStore } from '@/stores/auth-store'
import { useShopWorkspaceStore } from '@/stores/shop-workspace-store'

export function ShopDashboardPage() {
  const shopId = useAuthStore((s) => s.shopId)
  const branchId = useShopWorkspaceStore((s) => s.branchId)
  const shop = mockShops.find((s) => s.id === shopId) ?? mockShops[0]
  const branches = branchesForShop(shop.id)

  const branchKey = branchId === 'all' ? 'all' : branchId
  const stats = dashboardSnapshot(shop.id, branchKey)
  const branchLabel =
    branchId === 'all'
      ? 'all branches'
      : (branches.find((b) => b.id === branchId)?.name ?? 'selected branch')

  return (
    <div className="flex-1 overflow-y-auto">
    <PageShell
      title="Dashboard"
      description={`Today's snapshot for ${shop.name} (${branchLabel}) — hardware, paint, and rental operations.`}
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's bills"
          value={String(stats.billsToday)}
          hint={stats.billsHint}
          icon={Receipt}
        />
        <StatCard
          label="SKU in stock"
          value={stats.skuInStock.toLocaleString()}
          icon={Package}
        />
        <StatCard
          label="Low stock SKUs"
          value={String(stats.lowStock)}
          hint="Below reorder"
          icon={Package}
          warning
        />
        <StatCard label="Rentals out" value={String(stats.rentalsOut)} icon={Truck} />
        <StatCard label="Staff on duty" value={String(stats.staffOnDuty)} icon={Users} />
      </section>

      <section className="card-widget">
        <h2 className="text-h2">Quick actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <button type="button" className="btn-primary">
            New sale
          </button>
          <button type="button" className="btn-secondary">
            Stock check
          </button>
          <button type="button" className="btn-danger">
            Record damage
          </button>
        </div>
      </section>
    </PageShell>
    </div>
  )
}