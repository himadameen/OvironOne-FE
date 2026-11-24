import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { INVENTORY_NAV } from '@/pages/admin/inventory/inventory-nav'

export function InventorySubnav() {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Inventory sections">
      {INVENTORY_NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            cn('profile-section-chip', isActive && 'profile-section-chip--active')
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}