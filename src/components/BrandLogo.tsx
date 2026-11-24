import { cn } from '@/lib/utils'

interface BrandLogoProps {
  partner?: string
  /** Sidebar / chrome — title case, no partner */
  wordmark?: boolean
  className?: string
  onDark?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizes = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl' }

export function BrandLogo({
  partner,
  wordmark,
  className,
  onDark,
  size = 'md',
}: BrandLogoProps) {
  const title = wordmark ? 'Oviron One' : 'OVIRON ONE'

  return (
    <div className={cn('font-display font-semibold tracking-tight', className)}>
      <p className={cn(sizes[size], wordmark && 'tracking-wide')}>
        <span
          className={onDark ? 'text-[#F4F1EC]' : 'text-brand-primary'}
        >
          {title}
        </span>
        {partner && !wordmark ? (
          <>
            <span className={onDark ? 'text-white/40' : 'text-muted'}> × </span>
            <span
              className={onDark ? 'text-brand-accent' : 'text-accent'}
            >
              {partner}
            </span>
          </>
        ) : null}
      </p>
    </div>
  )
}