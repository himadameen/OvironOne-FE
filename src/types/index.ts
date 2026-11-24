export type PackageTier = 'starter' | 'growth' | 'enterprise'

export type ShopVertical = 'paint' | 'hardware' | 'rental'

export type UserRole = 'shop_admin' | 'super_admin'

export interface Shop {
  id: string
  name: string
  vertical: ShopVertical
  package: PackageTier
  activeUsers: number
  inactiveUsers: number
  menusEnabled: string[]
  city: string
  isActive: boolean
}

export interface Branch {
  id: string
  shopId: string
  name: string
  code: string
  city: string
  isPrimary?: boolean
  addressLine1?: string
  addressLine2?: string
  state?: string
  pincode?: string
  phone?: string
  branchGstin?: string
}

export interface CompanyProfile {
  shopId: string
  legalName: string
  tradeName: string
  cin?: string
  gstin: string
  pan: string
  registeredAddress: string
  city: string
  state: string
  pincode: string
  phone: string
  email: string
}

export interface ProprietorProfile {
  name: string
  designation: string
  phone: string
  email: string
  pan?: string
}

export interface StaffAccessProfile {
  id: string
  name: string
  role: string
  email: string
  branchIds: string[] | 'all'
  access: string[]
  status: 'active' | 'inactive'
}

export interface DashboardSnapshot {
  billsToday: number
  billsHint: string
  skuInStock: number
  lowStock: number
  rentalsOut: number
  staffOnDuty: number
}

export interface MenuItem {
  id: string
  label: string
  path: string
  package: PackageTier
  group: string
}