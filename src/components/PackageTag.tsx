import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PackageTier } from '@/types'

interface PackageTagProps {
  tier: PackageTier
  className?: string
  compact?: boolean
  /** Readable on dark headers (profile hero) */
  onDark?: boolean
}

export function PackageTag({ tier, className, compact, onDark }: PackageTagProps) {
  const label = compact
    ? { starter: 'ST', growth: 'GR', enterprise: 'EP' }[tier]
    : tier

  const isEnterprise = tier === 'enterprise'

  return (
    <span className={cn('package-tag-wrap', className)}>
      <span
        className={cn(
          'package-tag',
          `package-tag-${tier}`,
          compact && 'package-tag--compact',
          onDark && 'package-tag-on-dark',
          isEnterprise && 'package-tag--enterprise-star'
        )}
        title={`${tier} package`}
      >
        {label}
      </span>
      {isEnterprise ? (
        <Star
          className={cn('package-tag-star-badge', compact && 'package-tag-star-badge--sm')}
          aria-hidden
        />
      ) : null}
    </span>
  )
}