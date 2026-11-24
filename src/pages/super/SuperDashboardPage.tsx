import { Store, UserCheck, UserX, Users } from 'lucide-react'
import { PageShell } from '@/components/PageShell'
import { StatCard } from '@/components/StatCard'
import { mockShops } from '@/data/mock-shops'

export function SuperDashboardPage() {
  const activeShops = mockShops.filter((s) => s.isActive).length
  const activeUsers = mockShops.reduce((n, s) => n + s.activeUsers, 0)
  const inactiveUsers = mockShops.reduce((n, s) => n + s.inactiveUsers, 0)

  return (
    <PageShell
      title="Platform dashboard"
      description="Active shops, user counts, and package adoption."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active shops" value={String(activeShops)} icon={Store} />
        <StatCard label="Total shops" value={String(mockShops.length)} icon={Users} />
        <StatCard label="Active users" value={String(activeUsers)} icon={UserCheck} />
        <StatCard
          label="Inactive users"
          value={String(inactiveUsers)}
          hint="Invited, not signed in"
          icon={UserX}
          warning
        />
      </section>

      <section className="card-widget overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Shop</th>
              <th>Package</th>
              <th>Active</th>
              <th>Inactive</th>
            </tr>
          </thead>
          <tbody>
            {mockShops.map((shop) => (
              <tr key={shop.id}>
                <td className="font-medium">{shop.name}</td>
                <td className="capitalize">{shop.package}</td>
                <td>{shop.activeUsers}</td>
                <td>{shop.inactiveUsers}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageShell>
  )
}