import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  warning?: boolean
}

export function StatCard({ label, value, hint, icon: Icon, warning }: StatCardProps) {
  return (
    <article className="card-widget flex gap-4">
      <div className={cn('stat-icon', warning && 'stat-icon-warning')}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
        <p className={cn('stat-value mt-0.5', warning && 'stat-value-warning')}>
          {value}
        </p>
        {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
      </div>
    </article>
  )
}