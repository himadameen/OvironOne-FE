import { PageShell } from '@/components/PageShell'
import { mockShops } from '@/data/mock-shops'

const rows = mockShops.flatMap((shop) => [
  {
    name: `${shop.name} Owner`,
    email: 'owner@demo.local',
    shop: shop.name,
    status: 'active' as const,
  },
  {
    name: `${shop.name} Cashier`,
    email: 'cashier@demo.local',
    shop: shop.name,
    status: shop.isActive ? ('active' as const) : ('inactive' as const),
  },
])

export function SuperUsersPage() {
  return (
    <PageShell
      title="Users"
      description="Active and inactive accounts across all shops."
    >
      <div className="card-widget overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Shop</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.email}-${row.shop}`}>
                <td className="font-medium">{row.name}</td>
                <td className="text-muted">{row.email}</td>
                <td>{row.shop}</td>
                <td
                  className={
                    row.status === 'active' ? 'text-brand-primary' : 'text-muted'
                  }
                >
                  {row.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageShell>
  )
}