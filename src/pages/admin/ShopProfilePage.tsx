import { useEffect, useState } from 'react'
import { PageShell } from '@/components/PageShell'
import { ProfileIdentityCard } from '@/components/profile/ProfileIdentityCard'
import { ProfileSectionCrud } from '@/components/profile/ProfileSectionCrud'
import { PROFILE_SECTIONS, type SectionId } from '@/pages/admin/profile-sections'
import { mockShops } from '@/data/mock-shops'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import { confirmDialog } from '@/stores/confirm-dialog-store'
import { useShopProfileStore } from '@/stores/shop-profile-store'

function initialsFromEmail(email: string) {
  const local = email.split('@')[0] ?? ''
  const parts = local.split(/[._-]/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return local.slice(0, 2).toUpperCase()
}

export function ShopProfilePage() {
  const email = useAuthStore((s) => s.email)
  const shopId = useAuthStore((s) => s.shopId) ?? 'shop-ambur'
  const partnerBrand = useAuthStore((s) => s.partnerBrand)
  const shop = mockShops.find((s) => s.id === shopId) ?? mockShops[0]
  const [section, setSection] = useState<SectionId>('overview')

  const ensureLoaded = useShopProfileStore((s) => s.ensureLoaded)
  const proprietor = useShopProfileStore((s) => s.proprietor)
  const branches = useShopProfileStore((s) => s.branches)
  const staff = useShopProfileStore((s) => s.staff)
  const setDisplayPhotoUrl = useShopProfileStore((s) => s.setDisplayPhotoUrl)

  useEffect(() => {
    ensureLoaded(shop.id)
  }, [ensureLoaded, shop.id])

  const displayName = proprietor?.name ?? 'Shop admin'
  const initials = initialsFromEmail(email)

  return (
  <div className="page-wrap profile-page flex min-h-0 flex-1 flex-col">
    <PageShell
      title="Profile"
      description="Manage company, branches, roles, and tax identity. Shop admins can edit all fields below."
    >
      <div className="profile-page-grid">
        <ProfileIdentityCard
          displayName={displayName}
          email={email}
          initials={initials}
          packageTier={shop.package}
          branchCount={branches.length}
          teamCount={staff.length}
          onPhotoClick={() => {
            void confirmDialog({
              title: 'Profile photo',
              message: 'Photo upload is not connected in this demo. Your initials avatar will be used.',
              alertOnly: true,
            })
            setDisplayPhotoUrl(null)
          }}
        />

        <div className="profile-page-main">
          <div className="profile-page-tabs shrink-0">
            <label className="mb-0 block lg:hidden">
              <span className="sr-only">Section</span>
              <select
                className="input-field !h-10"
                value={section}
                onChange={(e) => setSection(e.target.value as SectionId)}
              >
                {PROFILE_SECTIONS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="hidden flex-wrap gap-2 lg:flex">
              {PROFILE_SECTIONS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    'profile-section-chip',
                    section === item.id && 'profile-section-chip--active'
                  )}
                  onClick={() => setSection(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="profile-panel-scroll">
            <article className="card-widget profile-panel">
              <ProfileSectionCrud
                section={section}
                email={email}
                partnerBrand={partnerBrand}
                packageTier={shop.package}
                shopId={shop.id}
              />
            </article>
          </div>
        </div>
      </div>
    </PageShell>
  </div>
  )
}