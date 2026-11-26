import type { ReactNode } from 'react'
import { InventorySubnav } from '@/components/inventory/InventorySubnav'

interface InventoryCatalogPageLayoutProps {
  title: string
  description: ReactNode
  actions?: ReactNode
  children: ReactNode
}

/** Same shell as Stocks: full-width page-wrap, subnav, compact hero. */
export function InventoryCatalogPageLayout({
  title,
  description,
  actions,
  children,
}: InventoryCatalogPageLayoutProps) {
  return (
    <div className="page-wrap stocks-page stocks-page--anchored">
      <div className="stocks-catalog-subnav">
        <InventorySubnav />
      </div>
      <div className="stocks-page-body">
        <header className="stocks-hero card-widget stocks-hero--compact">
          <div className="stocks-hero-top">
            <div className="stocks-hero-copy">
              <h1 className="stocks-hero-title">{title}</h1>
              <p className="stocks-hero-desc">{description}</p>
            </div>
            {actions ? <div className="stocks-hero-aside">{actions}</div> : null}
          </div>
        </header>
        {children}
      </div>
    </div>
  )
}