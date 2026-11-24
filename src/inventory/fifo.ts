import type { StockBatch } from '@/inventory/types'

/** FIFO stock value from remaining batches (qty × cost). */
export function fifoValueFromBatches(batches: StockBatch[]): number {
  return batches.reduce((sum, b) => sum + b.qtyBase * b.costRatePerBase, 0)
}

export function totalQtyBase(batches: StockBatch[]): number {
  return batches.reduce((sum, b) => sum + b.qtyBase, 0)
}

/** Weighted average cost per base unit (for display cards). */
export function weightedAvgCost(batches: StockBatch[]): number {
  const qty = totalQtyBase(batches)
  if (qty <= 0) return 0
  return fifoValueFromBatches(batches) / qty
}