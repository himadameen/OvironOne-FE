import { PageShell } from '@/components/PageShell'

interface PlaceholderModulePageProps {
  title: string
  description: string
}

export function PlaceholderModulePage({
  title,
  description,
}: PlaceholderModulePageProps) {
  return (
    <div className="flex-1 overflow-y-auto">
    <PageShell title={title} description={description}>
      <div className="card-widget text-body text-muted">
        Module shell using global theme — tables use maroon headers; primary actions
        use royal purple.
      </div>
    </PageShell>
    </div>
  )
}