import { ArrowDownRight, ArrowUpRight, LineChart } from 'lucide-react'
import { formatInr } from '@/inventory/format-money'
import { cn } from '@/lib/utils'

export function yearTargetGap(actual: number, target: number) {
  if (target <= 0) return null
  const diff = actual - target
  return {
    target,
    actual,
    ahead: diff >= 0,
    gapInr: Math.abs(diff),
    pct: Math.min(100, (actual / target) * 100),
  }
}

interface YearTargetStatusProps {
  variant: 'compact' | 'card' | 'dialog'
  label: string
  actual: number
  target: number
  className?: string
}

/** Target vs actual with chart icon and ahead / below gap. */
export function YearTargetStatus({ variant, label, actual, target, className }: YearTargetStatusProps) {
  const gap = yearTargetGap(actual, target)
  if (!gap) return null

  const TrendIcon = gap.ahead ? ArrowUpRight : ArrowDownRight

  const actualLabel = label === 'Purc' ? 'Purchased' : 'Sold'

  if (variant === 'compact') {
    return (
      <p
        className={cn('stocks-kpi-target', gap.ahead ? 'stocks-kpi-target--ahead' : 'stocks-kpi-target--behind', className)}
        title={`${label} target ${formatInr(target)} · sold ${formatInr(actual)}`}
      >
        <LineChart className="stocks-target-chart-icon" aria-hidden />
        <span className="tabular-nums">
          Tgt {formatInr(target)} · Sold {formatInr(actual)}
        </span>
        <span className={cn('stocks-target-gap', gap.ahead ? 'stocks-target-gap--ahead' : 'stocks-target-gap--behind')}>
          <TrendIcon className="h-3 w-3 shrink-0" aria-hidden />
          {gap.ahead ? 'Ahead' : 'Below'} {formatInr(gap.gapInr)}
        </span>
      </p>
    )
  }

  if (variant === 'dialog') {
    const tone = label === 'Sale' ? 'sale' : 'purc'
    return (
      <article
        className={cn(
          'stocks-target-dialog-card',
          gap.ahead ? 'stocks-target-dialog-card--ahead' : 'stocks-target-dialog-card--behind',
          className
        )}
      >
        <div className="stocks-target-dialog-top">
          <LineChart className="stocks-target-chart-icon stocks-target-chart-icon--card" aria-hidden />
          <span className="stocks-target-summary-label">
            {label} target <span className="font-normal text-muted">({yearPctLabel(gap.pct)})</span>
          </span>
        </div>
        <dl className="stocks-target-summary-grid stocks-target-summary-grid--dialog">
          <div>
            <dt>Target</dt>
            <dd className="tabular-nums">{formatInr(gap.target)}</dd>
          </div>
          <div>
            <dt>{actualLabel}</dt>
            <dd className="tabular-nums">{formatInr(gap.actual)}</dd>
          </div>
        </dl>
        <p
          className={cn(
            'stocks-target-gap stocks-target-gap--prominent stocks-target-gap--dialog',
            gap.ahead ? 'stocks-target-gap--ahead' : 'stocks-target-gap--behind'
          )}
        >
          <TrendIcon className="h-4 w-4 shrink-0" aria-hidden />
          <span>
            {gap.ahead ? 'Ahead of target' : 'Below target'} by{' '}
            <strong className="tabular-nums">{formatInr(gap.gapInr)}</strong>
          </span>
        </p>
        <TargetProgressTrack
          tone={tone}
          actual={gap.actual}
          target={gap.target}
          pct={gap.pct}
          actualLabel={actualLabel}
        />
      </article>
    )
  }

  return (
    <article
      className={cn(
        'stocks-target-summary-card',
        gap.ahead ? 'stocks-target-summary-card--ahead' : 'stocks-target-summary-card--behind',
        className
      )}
    >
      <div className="stocks-target-summary-head">
        <LineChart className="stocks-target-chart-icon stocks-target-chart-icon--card" aria-hidden />
        <span className="stocks-target-summary-label">{label} target ({gap.pct.toFixed(0)}%)</span>
      </div>
      <dl className="stocks-target-summary-grid">
        <div>
          <dt>Target</dt>
          <dd className="tabular-nums">{formatInr(gap.target)}</dd>
        </div>
        <div>
          <dt>{actualLabel}</dt>
          <dd className="tabular-nums">{formatInr(gap.actual)}</dd>
        </div>
      </dl>
      <p
        className={cn(
          'stocks-target-gap stocks-target-gap--prominent',
          gap.ahead ? 'stocks-target-gap--ahead' : 'stocks-target-gap--behind'
        )}
      >
        <TrendIcon className="h-4 w-4 shrink-0" aria-hidden />
        <span>
          {gap.ahead ? 'Ahead of target' : 'Below target'} by <strong className="tabular-nums">{formatInr(gap.gapInr)}</strong>
        </span>
      </p>
      <TargetProgressTrack
        tone={label === 'Sale' ? 'sale' : 'purc'}
        actual={gap.actual}
        target={gap.target}
        pct={gap.pct}
        actualLabel={actualLabel}
      />
    </article>
  )
}

export function TargetProgressTrack({
  tone,
  actual,
  target,
  pct,
  actualLabel,
  className,
}: {
  tone: 'sale' | 'purc'
  actual: number
  target: number
  pct: number
  actualLabel: string
  className?: string
}) {
  const fillWidth = pct > 0 ? Math.max(3, pct) : 0
  return (
    <div className={cn('stocks-target-progress-block', className)}>
      <div className="stocks-target-progress-head">
        <span className="stocks-target-progress-label">{actualLabel}</span>
        <span className="stocks-target-progress-meta tabular-nums">
          {formatInr(actual)} / {formatInr(target)} · {pct.toFixed(0)}%
        </span>
      </div>
      <div
        className="stocks-target-progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label={`${actualLabel} progress toward target`}
      >
        <span
          className={cn(
            'stocks-target-progress-fill',
            tone === 'sale' ? 'stocks-target-progress-fill--sale' : 'stocks-target-progress-fill--purc'
          )}
          style={{ width: `${fillWidth}%` }}
        />
      </div>
    </div>
  )
}

function yearPctLabel(pct: number) {
  return `${pct.toFixed(0)}%`
}