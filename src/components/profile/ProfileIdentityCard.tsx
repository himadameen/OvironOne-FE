import { Building2, Camera, ShieldCheck, Users } from 'lucide-react'
import { PackageTag } from '@/components/PackageTag'
import type { PackageTier } from '@/types'

interface ProfileIdentityCardProps {
  displayName: string
  email: string
  initials: string
  packageTier: PackageTier
  branchCount: number
  teamCount: number
  onPhotoClick?: () => void
}

export function ProfileIdentityCard({
  displayName,
  email,
  initials,
  packageTier,
  branchCount,
  teamCount,
  onPhotoClick,
}: ProfileIdentityCardProps) {
  return (
    <aside className="profile-identity-card lg:self-start">
      <div className="profile-identity-hero">
        <div className="flex items-start justify-between gap-2">
          <span className="profile-identity-badge">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Shop admin
          </span>
          <PackageTag tier={packageTier} compact onDark className="shrink-0" />
        </div>
      </div>

      <div className="profile-identity-body">
        <div className="-mt-10 flex flex-col items-center">
          <button
            type="button"
            className="profile-identity-avatar"
            onClick={onPhotoClick}
            aria-label="Update profile photo (demo)"
          >
            <span>{initials}</span>
            <span className="profile-identity-camera">
              <Camera className="h-3.5 w-3.5" />
            </span>
          </button>
          <p className="mt-3 text-center font-display text-lg font-semibold text-charcoal">
            {displayName}
          </p>
          <p className="text-center text-sm text-muted">{email}</p>
        </div>

        <div className="profile-identity-stats">
          <div className="profile-stat-tile">
            <span className="profile-stat-icon" aria-hidden>
              <Building2 className="h-4 w-4" />
            </span>
            <div className="profile-stat-copy">
              <p className="profile-stat-value">{branchCount}</p>
              <p className="profile-stat-label">Branches</p>
            </div>
          </div>
          <div className="profile-stat-divider" aria-hidden />
          <div className="profile-stat-tile">
            <span className="profile-stat-icon" aria-hidden>
              <Users className="h-4 w-4" />
            </span>
            <div className="profile-stat-copy">
              <p className="profile-stat-value">{teamCount}</p>
              <p className="profile-stat-label">Team</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}