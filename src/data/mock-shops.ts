import type { Shop } from '@/types'

export const mockShops: Shop[] = [
  {
    id: 'shop-ambur',
    name: 'Ambur Paint House',
    vertical: 'paint',
    package: 'enterprise',
    activeUsers: 12,
    inactiveUsers: 2,
    menusEnabled: ['dashboard', 'inventory', 'pos', 'rentals', 'projects', 'reports'],
    city: 'Ambur',
    isActive: true,
  },
  {
    id: 'shop-hardware',
    name: 'City Hardware Mart',
    vertical: 'hardware',
    package: 'growth',
    activeUsers: 8,
    inactiveUsers: 1,
    menusEnabled: ['dashboard', 'inventory', 'pos', 'suppliers', 'reports'],
    city: 'Chennai',
    isActive: true,
  },
  {
    id: 'shop-rental',
    name: 'BuildRent Pro',
    vertical: 'rental',
    package: 'starter',
    activeUsers: 4,
    inactiveUsers: 3,
    menusEnabled: ['dashboard', 'inventory', 'rentals'],
    city: 'Vellore',
    isActive: false,
  },
]