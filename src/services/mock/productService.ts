import type { Product } from "@/types/domain";
import { selectTenantData, selectBranchData } from "@/stores/demo-store";

export interface ProductFilters {
  tenantId: string | null;
  branchId: string | null;
  search?: string;
  activeOnly?: boolean;
}

export function filterProducts(
  products: Product[],
  filters: ProductFilters
): Product[] {
  let list = selectTenantData(products, filters.tenantId);
  list = selectBranchData(list, filters.branchId);
  if (filters.activeOnly) list = list.filter((p) => p.isActive);
  if (filters.search?.trim()) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.brand?.toLowerCase().includes(q) ?? false)
    );
  }
  return list;
}

export function getLowStockProducts(products: Product[]): Product[] {
  return products.filter((p) => p.stockQty <= p.reorderLevel);
}
