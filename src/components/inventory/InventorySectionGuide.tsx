import type { ReactNode } from 'react'

interface InventorySectionGuideProps {
  children: ReactNode
}

/** Plain-language hint under inventory section headers. */
export function InventorySectionGuide({ children }: InventorySectionGuideProps) {
  return (
    <div className="inv-kind-guide rounded-lg border border-silver bg-table-header/80 px-3 py-2.5 text-sm leading-relaxed text-muted">
      {children}
    </div>
  )
}