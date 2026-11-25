/** Short labels for dense stock table / chips (Stocks page). */
export const STOCK_SHORT = {
  expiry: 'Exp',
  expired: 'Exp',
  expiring: 'Exp ≤30d',
  inDate: 'In DT',
  purchased: 'purc',
  purchasedKpi: 'Purc',
  saleKpi: 'Sale',
  remaining: 'rem',
  purchaseCost: 'Purc cost',
  discSell: 'Max Disc',
  inStk: 'In Stk',
  allLines: 'All lines',
} as const

export function expiryBadgeLabel(
  days: number,
  tone: 'green' | 'amber' | 'red',
  compact: boolean
): string {
  if (compact) {
    if (days < 0) return `Exp · ${Math.abs(days)}d ago`
    if (days === 0) return 'Exp today'
    if (tone === 'green') return `In DT · ${days}d`
    if (tone === 'amber') return `Exp soon · ${days}d`
    return `Exp · ${days}d`
  }
  if (days < 0) return `Expired · ${Math.abs(days)} d ago`
  if (days === 0) return 'Expires today'
  if (tone === 'green') return `In date · ${days} d left`
  return `${days} d left`
}