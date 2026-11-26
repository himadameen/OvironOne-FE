import type { LucideIcon } from 'lucide-react'
import { Beaker, Calendar, Package, Palette, Tag, Wrench } from 'lucide-react'
import type { CategoryGuideIcon, CategoryKindConfig } from '@/inventory/category-kind-config'
import type { InventoryCategoryKind } from '@/inventory/types'
import { cn } from '@/lib/utils'

const GUIDE_ICONS: Record<CategoryGuideIcon, LucideIcon> = {
  palette: Palette,
  package: Package,
  calendar: Calendar,
  tag: Tag,
  beaker: Beaker,
  wrench: Wrench,
}

interface CategoryKindStockGuideProps {
  kind: InventoryCategoryKind
  config: CategoryKindConfig
  variant?: 'panel' | 'compact'
  className?: string
}

export function CategoryKindStockGuide({ kind, config, variant = 'panel', className }: CategoryKindStockGuideProps) {
  const isCompact = variant === 'compact'

  return (
    <aside
      className={cn(
        'inv-kind-guide',
        isCompact && 'inv-kind-guide--compact',
        `inv-kind-guide--${kind}`,
        className
      )}
      aria-label={`${config.label} category guidance`}
    >
      <header className="inv-kind-guide-head">
        <span className={cn('inv-kind-badge', `inv-kind-badge--${kind}`)}>{config.label}</span>
        {!isCompact ? (
          <p className="inv-kind-guide-lead">{config.stockRulesLead}</p>
        ) : (
          <p className="inv-kind-guide-lead inv-kind-guide-lead--tight">{config.addStockPreview}</p>
        )}
      </header>

      <ul className="inv-kind-guide-grid">
        {config.guideItems.map((item) => {
          const Icon = GUIDE_ICONS[item.icon]
          return (
            <li key={item.title} className="inv-kind-guide-tile">
              <span className="inv-kind-guide-icon" aria-hidden>
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <div className="inv-kind-guide-tile-text">
                <span className="inv-kind-guide-tile-title">{item.title}</span>
                <span className="inv-kind-guide-tile-detail">{item.detail}</span>
              </div>
            </li>
          )
        })}
      </ul>

      {!isCompact ? (
        <footer className="inv-kind-guide-foot">
          <span className="inv-kind-guide-foot-label">Add stock shows</span>
          <span className="inv-kind-guide-foot-value">{config.addStockPreview}</span>
        </footer>
      ) : null}
    </aside>
  )
}