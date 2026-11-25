import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface YearTargetAmounts {
  saleTargetInr: number
  purchaseTargetInr: number
}

interface StocksTargetsState {
  /** shopId → calendar year → targets */
  byShop: Record<string, Record<number, YearTargetAmounts>>
  setYearTargets: (shopId: string, year: number, targets: Partial<YearTargetAmounts>) => void
  targetsForYear: (shopId: string, year: number) => YearTargetAmounts
}

export const EMPTY_YEAR_TARGETS: YearTargetAmounts = {
  saleTargetInr: 0,
  purchaseTargetInr: 0,
}

/** Demo / preset until targets are saved for a year in the app. */
export const SEEDED_YEAR_TARGETS_2025: YearTargetAmounts = {
  saleTargetInr: 5_000_000,
  purchaseTargetInr: 4_200_000,
}

export function yearTargetsConfigured(targets: YearTargetAmounts): boolean {
  return targets.saleTargetInr > 0 || targets.purchaseTargetInr > 0
}

export function yearTargetsForShop(
  byShop: Record<string, Record<number, YearTargetAmounts>>,
  shopId: string,
  year: number
): YearTargetAmounts {
  const stored = byShop[shopId]?.[year]
  if (stored) return stored
  if (year === 2025) return SEEDED_YEAR_TARGETS_2025
  return EMPTY_YEAR_TARGETS
}

const empty = (): YearTargetAmounts => EMPTY_YEAR_TARGETS

export const useStocksTargetsStore = create<StocksTargetsState>()(
  persist(
    (set, get) => ({
      byShop: {},
      setYearTargets: (shopId, year, patch) => {
        const shop = get().byShop[shopId] ?? {}
        const prev = shop[year] ?? empty()
        set({
          byShop: {
            ...get().byShop,
            [shopId]: {
              ...shop,
              [year]: { ...prev, ...patch },
            },
          },
        })
      },
      targetsForYear: (shopId, year) => {
        return yearTargetsForShop(get().byShop, shopId, year)
      },
    }),
    { name: 'oviron-stocks-targets' }
  )
)