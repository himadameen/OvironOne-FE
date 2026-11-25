import { cn } from '@/lib/utils'

interface MarginBarProps {
  percent: number
  className?: string
  /** Row layout: percent and bar on one line */
  inline?: boolean
}

export function MarginBar({ percent, className, inline }: MarginBarProps) {
  const width = Math.min(100, Math.max(0, percent))
  const tone = percent >= 28 ? 'high' : percent >= 18 ? 'mid' : 'low'

  return (
    <div className={cn('stocks-margin', inline && 'stocks-margin--inline', className)}>
      <span className="stocks-margin-value">{percent.toFixed(1)}%</span>
      <span className="stocks-margin-track" aria-hidden>
        <span className={cn('stocks-margin-fill', `stocks-margin-fill--${tone}`)} style={{ width: `${width}%` }} />
      </span>
    </div>
  )
}