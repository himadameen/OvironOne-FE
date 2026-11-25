import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { formatInr } from '@/inventory/format-money'
import type { BrandTradeRow, MonthTradeRow } from '@/inventory/trade-history'
import { cn } from '@/lib/utils'
import { TargetProgressTrack, YearTargetStatus } from '@/components/inventory/YearTargetStatus'

interface StockTradeHistoryDialogProps {
  open: boolean
  focus: 'purchase' | 'sale'
  year: number
  years: number[]
  months: MonthTradeRow[]
  purchaseBrands: BrandTradeRow[]
  saleBrands: BrandTradeRow[]
  saleTargetInr: number
  purchaseTargetInr: number
  onSaveTargets: (saleTargetInr: number, purchaseTargetInr: number) => void
  onYearChange: (year: number) => void
  onClose: () => void
}

export function StockTradeHistoryDialog({
  open,
  focus,
  year,
  years,
  months,
  purchaseBrands,
  saleBrands,
  saleTargetInr,
  purchaseTargetInr,
  onSaveTargets,
  onYearChange,
  onClose,
}: StockTradeHistoryDialogProps) {
  const [draftSaleTarget, setDraftSaleTarget] = useState(String(saleTargetInr || ''))
  const [draftPurcTarget, setDraftPurcTarget] = useState(String(purchaseTargetInr || ''))

  useEffect(() => {
    if (!open) return
    setDraftSaleTarget(saleTargetInr > 0 ? String(saleTargetInr) : '')
    setDraftPurcTarget(purchaseTargetInr > 0 ? String(purchaseTargetInr) : '')
  }, [open, year, saleTargetInr, purchaseTargetInr])

  if (!open) return null

  const isPurchase = focus === 'purchase'
  const yearPurchase = months.reduce((s, r) => s + r.purchaseTotal, 0)
  const yearSale = months.reduce((s, r) => s + r.saleTotal, 0)
  const yearFocusTotal = isPurchase ? yearPurchase : yearSale
  const focusBrands = isPurchase ? purchaseBrands : saleBrands

  const maxMonth = Math.max(
    1,
    ...months.map((r) => (isPurchase ? r.purchaseTotal : r.saleTotal))
  )

  const focusTargetInr = isPurchase ? purchaseTargetInr : saleTargetInr
  const showTargetEditor = focusTargetInr <= 0

  const saveTargets = () => {
    if (isPurchase) {
      const purc = Math.max(0, Number(draftPurcTarget) || 0)
      onSaveTargets(saleTargetInr, purc)
    } else {
      const sale = Math.max(0, Number(draftSaleTarget) || 0)
      onSaveTargets(sale, purchaseTargetInr)
    }
  }

  const draftTargetPreview = Math.max(
    0,
    Number(isPurchase ? draftPurcTarget : draftSaleTarget) || 0
  )
  const draftPct =
    draftTargetPreview > 0 ? Math.min(100, (yearFocusTotal / draftTargetPreview) * 100) : 0

  return (
    <div className="confirm-backdrop confirm-backdrop--sheet" role="presentation" onClick={onClose}>
      <div
        className="support-dialog stocks-trade-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stocks-trade-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="stocks-trade-dialog-head">
          <div className="stocks-trade-dialog-titleblock">
            <h2 id="stocks-trade-title" className="stocks-trade-dialog-title">
              {focus === 'purchase' ? 'Purchase history' : 'Sale history'}
            </h2>
            <p className="stocks-trade-dialog-sub">
              {isPurchase ? 'Purchase' : 'Sale'} totals by month for {year} · branch filter applies
            </p>
          </div>
          <div className="stocks-trade-dialog-tools">
            <label className="stocks-trade-year">
              <span className="stocks-trade-year-label">Year</span>
              <select
                className="stocks-filter-select stocks-trade-year-select"
                value={year}
                onChange={(e) => onYearChange(Number(e.target.value))}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className="stocks-trade-close" onClick={onClose} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="stocks-trade-highlight">
          <article
            className={cn(
              'stocks-trade-hero-stat',
              isPurchase ? 'stocks-trade-hero-stat--purc' : 'stocks-trade-hero-stat--sale'
            )}
          >
            <span className="stocks-trade-hero-stat-label">
              {isPurchase ? 'Year purchase' : 'Year sale'} · {year}
            </span>
            <strong className="stocks-trade-hero-stat-value tabular-nums">{formatInr(yearFocusTotal)}</strong>
          </article>

          {showTargetEditor ? (
            <section className="stocks-trade-hero-target" aria-labelledby="stocks-target-heading">
              <h3 id="stocks-target-heading" className="stocks-trade-panel-title">
                {isPurchase ? 'Purchase' : 'Sale'} target
              </h3>
              <p className="stocks-trade-target-hint stocks-trade-target-hint--tight">
                {isPurchase
                  ? 'Annual purchase goal for this branch filter.'
                  : 'Annual sale goal for this branch filter.'}
              </p>
              <div className="stocks-trade-target-form stocks-trade-target-form--single">
                {isPurchase ? (
                  <label className="stocks-trade-target-field">
                    <span className="stocks-trade-target-label">Purc target (₹)</span>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      className="stocks-trade-target-input"
                      placeholder="e.g. 500000"
                      value={draftPurcTarget}
                      onChange={(e) => setDraftPurcTarget(e.target.value)}
                    />
                  </label>
                ) : (
                  <label className="stocks-trade-target-field">
                    <span className="stocks-trade-target-label">Sale target (₹)</span>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      className="stocks-trade-target-input"
                      placeholder="e.g. 500000"
                      value={draftSaleTarget}
                      onChange={(e) => setDraftSaleTarget(e.target.value)}
                    />
                  </label>
                )}
                <button type="button" className="btn-primary stocks-trade-target-save" onClick={saveTargets}>
                  Save target
                </button>
              </div>
              {draftTargetPreview > 0 ? (
                <TargetProgressTrack
                  className="stocks-target-progress-block--preview"
                  tone={isPurchase ? 'purc' : 'sale'}
                  actual={yearFocusTotal}
                  target={draftTargetPreview}
                  pct={draftPct}
                  actualLabel={isPurchase ? 'Purchased' : 'Sold'}
                />
              ) : null}
            </section>
          ) : focusTargetInr > 0 ? (
            <YearTargetStatus
              variant="dialog"
              className="stocks-trade-hero-target"
              label={isPurchase ? 'Purc' : 'Sale'}
              actual={yearFocusTotal}
              target={focusTargetInr}
            />
          ) : null}
        </div>

        <div className="stocks-trade-body">
          <section className="stocks-trade-panel stocks-trade-panel-card stocks-trade-panel--months">
            <h4 className="stocks-trade-panel-title stocks-trade-panel-title--spaced">
              By month · {isPurchase ? 'purchase ₹' : 'sale ₹'}
            </h4>
            <ul className="stocks-trade-month-grid stocks-trade-month-grid--cards">
              {months.map((row) => (
                <MonthRow
                  key={row.month}
                  row={row}
                  value={isPurchase ? row.purchaseTotal : row.saleTotal}
                  max={maxMonth}
                  tone={focus}
                />
              ))}
            </ul>
          </section>

          <section className="stocks-trade-panel stocks-trade-panel-card stocks-trade-panel--brands">
            <BrandPanel
              title={isPurchase ? 'Top purchase brands' : 'Top sale brands'}
              rows={focusBrands}
              year={year}
              bare
            />
          </section>
        </div>

        <footer className="stocks-trade-dialog-foot">
          <button type="button" className="btn-secondary !h-10 px-5 text-sm" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>
  )
}

function MonthRow({
  row,
  value,
  max,
  tone,
}: {
  row: MonthTradeRow
  value: number
  max: number
  tone: 'purchase' | 'sale'
}) {
  const shortLabel = row.label.replace(/\s+\d{4}$/, '')
  const width = `${Math.max(value > 0 ? 8 : 4, (value / max) * 100)}%`
  return (
    <li
      className={cn(
        'stocks-trade-month-row stocks-trade-month-row--card',
        value <= 0 && 'stocks-trade-month-row--empty'
      )}
    >
      <div className="stocks-trade-month-row-head">
        <span className="stocks-trade-month-label" title={row.label}>
          {shortLabel}
        </span>
        <span className="stocks-trade-month-value tabular-nums">{formatInr(value)}</span>
      </div>
      <span className="stocks-trade-month-bar" aria-hidden>
        <span
          className={cn(
            'stocks-trade-month-fill',
            tone === 'purchase' ? 'stocks-trade-month-fill--purc' : 'stocks-trade-month-fill--sale'
          )}
          style={{ width }}
        />
      </span>
    </li>
  )
}

function BrandPanel({
  title,
  rows,
  year,
  bare,
}: {
  title: string
  rows: BrandTradeRow[]
  year: number
  bare?: boolean
}) {
  return (
    <div className={cn(!bare && 'stocks-trade-brand-block')}>
      <h4 className="stocks-trade-panel-title stocks-trade-panel-title--spaced">
        {title} <span className="font-normal text-muted">({year})</span>
      </h4>
      {rows.length === 0 ? (
        <p className="stocks-trade-empty">No records yet.</p>
      ) : (
        <ol className="stocks-trade-brand-list">
          {rows.slice(0, 5).map((row, i) => (
            <li key={row.brand}>
              <span className="stocks-trade-brand-rank">{i + 1}</span>
              <span className="stocks-trade-brand-name">{row.brand}</span>
              <span className="stocks-trade-brand-amt tabular-nums">{formatInr(row.total)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

