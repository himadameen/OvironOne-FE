import { Ban } from 'lucide-react'
import { cn } from '@/lib/utils'

function hasNoShade(shadeName: string): boolean {
  const trimmed = shadeName.trim()
  return trimmed === '—' || trimmed === '-' || trimmed.toLowerCase() === 'none' || trimmed === ''
}

interface ShadeSwatchProps {
  hex: string
  shadeName: string
  className?: string
}

/** Colour column only — shade name in tooltip; ban icon when no shade. */
export function ShadeSwatch({ hex, shadeName, className }: ShadeSwatchProps) {
  if (hasNoShade(shadeName)) {
    return (
      <span
        className={cn('shade-swatch shade-swatch--none', className)}
      title="No shade — non-colour item"
      aria-label="No shade"
      >
        <Ban className="h-4 w-4" strokeWidth={2.25} aria-hidden />
      </span>
    )
  }

  return (
    <span
      className={cn('shade-swatch', className)}
      style={{ backgroundColor: hex }}
      title={shadeName}
      aria-label={`Shade: ${shadeName}`}
    />
  )
}