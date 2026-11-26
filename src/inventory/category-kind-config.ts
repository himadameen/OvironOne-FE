import type { DisplayUnit, InventoryCategory, InventoryCategoryKind } from '@/inventory/types'

export type CategoryGuideIcon = 'palette' | 'package' | 'calendar' | 'tag' | 'beaker' | 'wrench'

export interface CategoryGuideItem {
  icon: CategoryGuideIcon
  title: string
  detail: string
}

export interface CategoryKindConfig {
  label: string
  hint: string
  stockRulesTitle: string
  stockRulesLead: string
  addStockPreview: string
  unitLabel: string
  units: DisplayUnit[]
  defaultUnit: DisplayUnit
  packPresets: string[]
  defaultPackLabel: string
  trackExpiryDefault: boolean
  requiresShade: boolean
  guideItems: CategoryGuideItem[]
  variantLabel?: string
  /** @deprecated use guideItems — kept for migrations */
  stockNotes?: string[]
}

export const CATEGORY_KIND_CONFIG: Record<InventoryCategoryKind, CategoryKindConfig> = {
  paint: {
    label: 'Paint',
    hint: 'Shade & hex required',
    stockRulesTitle: 'Paint stock rules',
    stockRulesLead: 'What staff will fill in on Add stock for this category.',
    addStockPreview: 'Shade name · colour · pack · expiry',
    unitLabel: 'Volume unit',
    units: ['L', 'ml'],
    defaultUnit: 'L',
    packPresets: ['1 L', '4 L', '10 L', '20 L'],
    defaultPackLabel: '1 L',
    trackExpiryDefault: true,
    requiresShade: true,
    guideItems: [
      { icon: 'palette', title: 'Shade & colour', detail: 'Name and hex colour are required.' },
      { icon: 'package', title: 'Pack size', detail: 'Usually 1 L, 4 L, or 20 L tins.' },
      { icon: 'calendar', title: 'Batch expiry', detail: 'Each receive line needs an expiry date.' },
    ],
  },
  accessory: {
    label: 'Accessory',
    hint: 'Brushes, rollers, tools',
    stockRulesTitle: 'Accessory stock rules',
    stockRulesLead: 'Count-based items — no paint shade workflow.',
    addStockPreview: 'Size/spec label · pack · qty (nos)',
    unitLabel: 'Count unit',
    units: ['nos'],
    defaultUnit: 'nos',
    packPresets: ['1 nos', '3 nos', '6 nos', '12 nos'],
    defaultPackLabel: '1 nos',
    trackExpiryDefault: false,
    requiresShade: false,
    variantLabel: 'Size / spec (optional)',
    guideItems: [
      { icon: 'wrench', title: 'No colour shade', detail: 'Optional label, e.g. 9″ roller.' },
      { icon: 'tag', title: 'Pieces (nos)', detail: 'Stock qty counted in numbers.' },
      { icon: 'calendar', title: 'Expiry', detail: 'Often skipped for tools — you choose below.' },
    ],
  },
  consumable: {
    label: 'Consumable',
    hint: 'Putty, thinner, fillers',
    stockRulesTitle: 'Consumable stock rules',
    stockRulesLead: 'Bulk materials — weight or volume, no shade picker.',
    addStockPreview: 'Product name · pack · unit · expiry',
    unitLabel: 'Default unit',
    units: ['L', 'ml', 'kg', 'g'],
    defaultUnit: 'kg',
    packPresets: ['1 kg', '5 kg', '1 L', '500 ml'],
    defaultPackLabel: '1 kg',
    trackExpiryDefault: true,
    requiresShade: false,
    guideItems: [
      { icon: 'beaker', title: 'No shade', detail: 'Product name only — no colour fields.' },
      { icon: 'package', title: 'Unit & pack', detail: 'kg, L, ml, or g with your default pack.' },
      { icon: 'calendar', title: 'Shelf life', detail: 'Turn expiry on when the material expires.' },
    ],
  },
}

export function unitsForCategoryKind(kind: InventoryCategoryKind): DisplayUnit[] {
  return CATEGORY_KIND_CONFIG[kind].units
}

export function categoryTrackExpiry(category: Pick<InventoryCategory, 'kind' | 'trackExpiry'>): boolean {
  if (category.trackExpiry !== undefined) return category.trackExpiry
  return CATEGORY_KIND_CONFIG[category.kind].trackExpiryDefault
}

export function categoryKindOptions(): { value: InventoryCategoryKind; label: string; hint: string }[] {
  return (Object.keys(CATEGORY_KIND_CONFIG) as InventoryCategoryKind[]).map((value) => ({
    value,
    label: CATEGORY_KIND_CONFIG[value].label,
    hint: CATEGORY_KIND_CONFIG[value].hint,
  }))
}