export type ExpiryTone = 'green' | 'amber' | 'red'

export function daysUntilExpiry(expiryDate: string, today = new Date()): number {
  const end = new Date(expiryDate)
  end.setHours(0, 0, 0, 0)
  const start = new Date(today)
  start.setHours(0, 0, 0, 0)
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export function expiryTone(expiryDate: string, today = new Date()): ExpiryTone {
  const days = daysUntilExpiry(expiryDate, today)
  if (days < 0) return 'red'
  if (days <= 30) return 'amber'
  return 'green'
}