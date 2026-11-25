import type { ReactNode } from 'react'
import { InventorySubnav } from '@/components/inventory/InventorySubnav'

interface InventoryCatalogPageLayoutProps {
  title: string
  description: ReactNode
  children: ReactNode
}

/** Same shell as Stocks: full-width page-wrap, subnav, compact hero. */
export function InventoryCatalogPageLayout({ title, description, children }: InventoryCatalogPageLayoutProps) {
  return (
    <div className="page-wrap stocks-page">
      <div className="stocks-catalog-subnav">
        <InventorySubnav />
      </div>
      <header className="stocks-hero card-widget stocks-hero--compact">
        <div className="stocks-hero-top">
          <div className="stocks-hero-copy">
            <h1 className="stocks-hero-title">{title}</h1>
            <p className="stocks-hero-desc">{description}</p>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}