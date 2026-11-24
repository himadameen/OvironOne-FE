export const PROFILE_SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'company', label: 'Company' },
  { id: 'branches', label: 'Branches' },
  { id: 'proprietor', label: 'Proprietor' },
  { id: 'roles', label: 'Roles & access' },
  { id: 'tax', label: 'GST & PAN' },
] as const

export type SectionId = (typeof PROFILE_SECTIONS)[number]['id']

export const ACCESS_OPTIONS = [
  'Dashboard',
  'POS',
  'Inventory',
  'Rentals',
  'Reports',
  'Staff',
  'Settings',
  'Suppliers',
  'Stock check',
] as const