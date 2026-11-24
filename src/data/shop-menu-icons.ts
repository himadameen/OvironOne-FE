import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  FolderKanban,
  LayoutDashboard,
  Package,
  Receipt,
  Truck,
  Users,
  Warehouse,
} from 'lucide-react'

export const shopMenuIcons: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  inventory: Package,
  pos: Receipt,
  suppliers: Warehouse,
  rentals: Truck,
  projects: FolderKanban,
  reports: BarChart3,
  staff: Users,
}