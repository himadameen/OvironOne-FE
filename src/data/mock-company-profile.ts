import { branchesForShop } from '@/data/mock-branches'
import type { CompanyProfile, ProprietorProfile, StaffAccessProfile } from '@/types'

const companies: Record<string, CompanyProfile> = {
  'shop-ambur': {
    shopId: 'shop-ambur',
    legalName: 'Ambur Paint House Private Limited',
    tradeName: 'Ambur Paint House',
    cin: 'U46909TN2018PTC124567',
    gstin: '33AABCA1234F1Z5',
    pan: 'AABCA1234F',
    registeredAddress: 'No. 18, Vaniyambadi Road, Near Bus Stand',
    city: 'Ambur',
    state: 'Tamil Nadu',
    pincode: '635802',
    phone: '+91 4174 228 451',
    email: 'accounts@amburpaint.demo',
  },
  'shop-hardware': {
    shopId: 'shop-hardware',
    legalName: 'City Hardware Mart',
    tradeName: 'City Hardware Mart',
    gstin: '33AAFCC5678G2Z8',
    pan: 'AAFCC5678G',
    registeredAddress: '12, Arcot Road, Virugambakkam',
    city: 'Chennai',
    state: 'Tamil Nadu',
    pincode: '600092',
    phone: '+91 44 4956 1120',
    email: 'info@cityhardware.demo',
  },
}

const proprietors: Record<string, ProprietorProfile> = {
  'shop-ambur': {
    name: 'R. Venkatesh Murthy',
    designation: 'Proprietor & Managing Director',
    phone: '+91 98430 228 451',
    email: 'owner@amburpaint.demo',
    pan: 'ABCPV4521L',
  },
  'shop-hardware': {
    name: 'S. Karthik',
    designation: 'Proprietor',
    phone: '+91 98840 112 003',
    email: 'owner@cityhardware.demo',
    pan: 'ABCPK8876M',
  },
}

const staffByShop: Record<string, StaffAccessProfile[]> = {
  'shop-ambur': [
    {
      id: 'u1',
      name: 'R. Venkatesh Murthy',
      role: 'Owner',
      email: 'owner@amburpaint.demo',
      branchIds: 'all',
      access: ['Dashboard', 'POS', 'Inventory', 'Reports', 'Staff', 'Settings'],
      status: 'active',
    },
    {
      id: 'u2',
      name: 'Priya Selvam',
      role: 'Branch manager',
      email: 'priya@amburpaint.demo',
      branchIds: ['branch-ambur-main'],
      access: ['Dashboard', 'POS', 'Inventory', 'Rentals'],
      status: 'active',
    },
    {
      id: 'u3',
      name: 'Imran Basha',
      role: 'Yard supervisor',
      email: 'imran@amburpaint.demo',
      branchIds: ['branch-ambur-yard'],
      access: ['Inventory', 'Rentals', 'Stock check'],
      status: 'active',
    },
    {
      id: 'u4',
      name: 'Counter team (shared)',
      role: 'Cashier',
      email: 'counter@amburpaint.demo',
      branchIds: ['branch-ambur-main'],
      access: ['POS', 'Dashboard'],
      status: 'active',
    },
  ],
  'shop-hardware': [
    {
      id: 'h1',
      name: 'S. Karthik',
      role: 'Owner',
      email: 'owner@cityhardware.demo',
      branchIds: 'all',
      access: ['Dashboard', 'POS', 'Inventory', 'Suppliers'],
      status: 'active',
    },
  ],
}

export function companyForShop(shopId: string): CompanyProfile | null {
  return companies[shopId] ?? companies['shop-ambur'] ?? null
}

export function proprietorForShop(shopId: string): ProprietorProfile | null {
  return proprietors[shopId] ?? proprietors['shop-ambur'] ?? null
}

export function staffForShop(shopId: string): StaffAccessProfile[] {
  return staffByShop[shopId] ?? staffByShop['shop-ambur'] ?? []
}

export interface ShopProfileBundle {
  company: CompanyProfile
  proprietor: ProprietorProfile
  branches: import('@/types').Branch[]
  staff: StaffAccessProfile[]
}

export function createShopProfileBundle(shopId: string): ShopProfileBundle | null {
  const company = companyForShop(shopId)
  const proprietor = proprietorForShop(shopId)
  if (!company || !proprietor) return null
  return {
    company,
    proprietor,
    branches: enrichBranchesAddresses(shopId),
    staff: [...staffForShop(shopId)],
  }
}

export function enrichBranchesAddresses(shopId: string) {
  const branches = branchesForShop(shopId)
  if (shopId === 'shop-ambur') {
    return branches.map((b) => {
      if (b.id === 'branch-ambur-main') {
        return {
          ...b,
          addressLine1: 'No. 18, Vaniyambadi Road',
          addressLine2: 'Main Street, Near Bus Stand',
          state: 'Tamil Nadu',
          pincode: '635802',
          phone: '+91 4174 228 451',
          branchGstin: '33AABCA1234F1Z5',
        }
      }
      return {
        ...b,
        addressLine1: 'SF No. 412/2, Katpadi Link Road',
        addressLine2: 'Industrial yard — rentals & bulk stock',
        state: 'Tamil Nadu',
        pincode: '635804',
        phone: '+91 4174 229 880',
        branchGstin: '33AABCA1234F2Z4',
      }
    })
  }
  return branches.map((b) => ({
    ...b,
    addressLine1: '12, Arcot Road',
    addressLine2: 'Virugambakkam',
    state: 'Tamil Nadu',
    pincode: '600092',
    phone: '+91 44 4956 1120',
    branchGstin: companies[shopId]?.gstin,
  }))
}