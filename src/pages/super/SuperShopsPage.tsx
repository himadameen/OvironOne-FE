import { useState } from 'react'
import { PageShell } from '@/components/PageShell'
import { mockShops } from '@/data/mock-shops'
import { shopMenuCatalog } from '@/data/shop-menus'
import type { PackageTier, Shop } from '@/types'

export function SuperShopsPage() {
  const [shops, setShops] = useState<Shop[]>(mockShops)

  const toggleMenu = (shopId: string, menuId: string) => {
    setShops((list) =>
      list.map((shop) => {
        if (shop.id !== shopId) return shop
        const has = shop.menusEnabled.includes(menuId)
        const menusEnabled = has
          ? shop.menusEnabled.filter((id) => id !== menuId)
          : [...shop.menusEnabled, menuId]
        return { ...shop, menusEnabled }
      })
    )
  }

  const setPackage = (shopId: string, pkg: PackageTier) => {
    setShops((list) =>
      list.map((s) => (s.id === shopId ? { ...s, package: pkg } : s))
    )
  }

  return (
    <PageShell
      title="Shops & access"
      description="Package tier caps menus; toggle modules per tenant."
    >
      <div className="space-y-4">
        {shops.map((shop) => (
          <article key={shop.id} className="card-widget space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-h2">{shop.name}</h2>
                <p className="text-small text-muted capitalize">
                  {shop.vertical} · {shop.city} · {shop.isActive ? 'Active' : 'Suspended'}
                </p>
              </div>
              <label className="flex items-center gap-2 text-body">
                Package
                <select
                  className="input-field !h-9 !w-auto"
                  value={shop.package}
                  onChange={(e) =>
                    setPackage(shop.id, e.target.value as PackageTier)
                  }
                >
                  <option value="starter">Starter</option>
                  <option value="growth">Growth</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {shopMenuCatalog.map((menu) => {
                const on = shop.menusEnabled.includes(menu.id)
                return (
                  <button
                    key={menu.id}
                    type="button"
                    onClick={() => toggleMenu(shop.id, menu.id)}
                    className={
                      on
                        ? 'rounded-btn border border-brand-accent/45 bg-brand-accent/15 px-3 py-1 text-small font-medium text-brand-primary'
                        : 'rounded-btn border border-silver bg-white px-3 py-1 text-small text-muted hover:border-brand-accent/30'
                    }
                  >
                    {menu.label}
                  </button>
                )
              })}
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  )
}