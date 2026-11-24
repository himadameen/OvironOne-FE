import { Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarBrandMarkProps {
  partnerName?: string
  compact?: boolean
  className?: string
}

export function SidebarBrandMark({
  partnerName = 'Partner',
  compact,
  className,
}: SidebarBrandMarkProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2.5',
        compact && 'flex-col gap-1.5',
        className
      )}
    >
      <span className={cn('sidebar-mark', !compact && 'sidebar-mark--md')} title="Oviron One">
        O1
      </span>
      <span className="sidebar-join" aria-hidden>
        ×
      </span>
      <span
        className={cn('sidebar-partner-icon', compact && 'sidebar-partner-icon--sm')}
        title={partnerName}
      >
        <Building2 className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden />
        <span className="sr-only">{partnerName}</span>
      </span>
    </div>
  )
}