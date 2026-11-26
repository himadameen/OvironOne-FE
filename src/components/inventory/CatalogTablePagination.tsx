import { ChevronLeft, ChevronRight } from 'lucide-react'
import { STOCK_PAGE_SIZES } from '@/inventory/stock-filters'

interface CatalogTablePaginationProps {
  page: number
  pageSize: number
  totalItems: number
  pageItemCount: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  itemLabel?: string
}

export function CatalogTablePagination({
  page,
  pageSize,
  totalItems,
  pageItemCount,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'rows',
}: CatalogTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  return (
    <footer className="stocks-pagination">
      <p className="stocks-pagination-meta">
        Showing <strong>{pageItemCount}</strong> of <strong>{totalItems}</strong> {itemLabel}
      </p>
      <label className="stocks-page-size">
        <span className="text-xs font-medium text-muted">Rows per page</span>
        <select
          className="stocks-filter-select !h-9 !min-w-[4.5rem]"
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value))
            onPageChange(1)
          }}
        >
          {STOCK_PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <div className="stocks-pagination-nav">
        <button
          type="button"
          className="btn-secondary !h-9 !px-2.5"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-medium tabular-nums">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className="btn-secondary !h-9 !px-2.5"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </footer>
  )
}