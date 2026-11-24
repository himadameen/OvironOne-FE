import { Link } from 'react-router-dom'
import { UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProfileProps {
  email?: string
  compact?: boolean
  className?: string
}

function initialsFromEmail(email: string) {
  const local = email.split('@')[0] ?? 'U'
  const parts = local.split(/[._-]/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return local.slice(0, 2).toUpperCase()
}

export function SidebarProfile({ email = 'admin', compact, className }: SidebarProfileProps) {
  const initials = initialsFromEmail(email)

  return (
    <Link
      to="/admin/profile"
      className={cn(
        'sidebar-profile transition hover:border-brand-accent/40 hover:bg-row-hover',
        compact && 'sidebar-profile--compact',
        className
      )}
    >
      <span className="sidebar-profile-avatar" aria-hidden>
        {compact ? <UserRound className="h-4 w-4" /> : initials}
      </span>
      {!compact ? (
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-semibold text-charcoal">Profile</span>
          <span className="block truncate text-[11px] text-muted">{email}</span>
        </span>
      ) : null}
    </Link>
  )
}