import { cn } from '@/lib/utils'
import type { PackageTier } from '@/types'

const tierStyles: Record<PackageTier, string> = {
  starter: 'package-badge package-badge-starter',
  growth: 'package-badge package-badge-growth',
  enterprise: 'package-badge package-badge-enterprise',
}

interface PackageBadgeProps {
  tier: PackageTier
  className?: string
}

export function PackageBadge({ tier, className }: PackageBadgeProps) {
  return (
    <div className={cn(tierStyles[tier], className)}>
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
        Package
      </span>
      <span className="font-display text-sm font-semibold capitalize text-charcoal">{tier}</span>
    </div>
  )
}