import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createInitialDemoState } from "@/mocks/seed/initial-state";
import { DEMO_STORAGE_KEY } from "@/lib/storage";
import type {
  DemoState,
  Product,
  Sale,
  SaleLine,
  StockMovement,
} from "@/types/domain";
import { uid as newId } from "@/types/domain";

interface CompleteSaleInput {
  tenantId: string;
  branchId: string;
  customerName: string;
  customerId?: string;
  lines: SaleLine[];
  discount?: number;
  paymentMode: Sale["paymentMode"];
  soldBy: string;
  invoicePrefix?: string;
  allowStockOverride?: boolean;
}

interface DemoStore extends DemoState {
  resetDemo: () => void;
  upsertProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  completeSale: (input: CompleteSaleInput) => Sale | null;
  adjustStock: (
    productId: string,
    qtyDelta: number,
    note?: string
  ) => boolean;
}

function nextInvoiceNo(state: DemoState, tenantId: string, prefix = "INV"): string {
  const count =
    state.sales.filter((s) => s.tenantId === tenantId).length + 1;
  return `${prefix}/${count.toString().padStart(4, "0")}`;
}

export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      ...createInitialDemoState(),
      resetDemo: () => set(createInitialDemoState()),
      upsertProduct: (product) =>
        set((state) => {
          const idx = state.products.findIndex((p) => p.id === product.id);
          const products =
            idx >= 0
              ? state.products.map((p) => (p.id === product.id ? product : p))
              : [...state.products, product];
          return { products };
        }),
      deleteProduct: (productId) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
        })),
      completeSale: (input) => {
        const state = get();
        for (const line of input.lines) {
          const product = state.products.find((p) => p.id === line.productId);
          if (!product) return null;
          if (!input.allowStockOverride && product.stockQty < line.qty) return null;
        }
        const subtotal = input.lines.reduce((s, l) => s + l.lineTotal, 0);
        const discount = input.discount ?? 0;
        const taxable = subtotal - discount;
        const tax = Math.round(taxable * 0.18 * 100) / 100;
        const total = taxable + tax;
        const sale: Sale = {
          id: newId("sale"),
          tenantId: input.tenantId,
          branchId: input.branchId,
          invoiceNo: nextInvoiceNo(state, input.tenantId, input.invoicePrefix),
          customerId: input.customerId,
          customerName: input.customerName,
          lines: input.lines,
          subtotal,
          discount,
          tax,
          total,
          paymentMode: input.paymentMode,
          soldAt: new Date().toISOString(),
          soldBy: input.soldBy,
        };
        const products = state.products.map((p) => {
          const line = input.lines.find((l) => l.productId === p.id);
          if (!line) return p;
          const nextQty = input.allowStockOverride
            ? Math.max(0, p.stockQty - line.qty)
            : p.stockQty - line.qty;
          return { ...p, stockQty: nextQty };
        });
        const movements: StockMovement[] = input.lines.map((line) => {
          const product = products.find((p) => p.id === line.productId)!;
          return {
            id: newId("stk"),
            tenantId: input.tenantId,
            branchId: input.branchId,
            productId: line.productId,
            productName: line.productName,
            type: "sale",
            qtyDelta: -line.qty,
            balanceAfter: product.stockQty,
            reference: sale.invoiceNo,
            createdAt: sale.soldAt,
          };
        });
        const customers = state.customers.map((c) =>
          c.id === input.customerId
            ? {
                ...c,
                totalSpend: c.totalSpend + total,
                lastVisit: sale.soldAt,
              }
            : c
        );
        set({
          products,
          sales: [sale, ...state.sales],
          stockMovements: [...movements, ...state.stockMovements],
          customers,
        });
        return sale;
      },
      adjustStock: (productId, qtyDelta, note) => {
        const state = get();
        const product = state.products.find((p) => p.id === productId);
        if (!product) return false;
        const stockQty = product.stockQty + qtyDelta;
        if (stockQty < 0) return false;
        const updated = { ...product, stockQty };
        const movement: StockMovement = {
          id: newId("stk"),
          tenantId: product.tenantId,
          branchId: product.branchId,
          productId,
          productName: product.name,
          type: "adjustment",
          qtyDelta,
          balanceAfter: stockQty,
          note,
          createdAt: new Date().toISOString(),
        };
        set({
          products: state.products.map((p) =>
            p.id === productId ? updated : p
          ),
          stockMovements: [movement, ...state.stockMovements],
        });
        return true;
      },
    }),
    { name: DEMO_STORAGE_KEY }
  )
);

export function selectTenantData<T extends { tenantId: string }>(
  items: T[],
  tenantId: string | null
): T[] {
  if (!tenantId) return items;
  return items.filter((i) => i.tenantId === tenantId);
}

export function selectBranchData<T extends { branchId: string }>(
  items: T[],
  branchId: string | null
): T[] {
  if (!branchId) return items;
  return items.filter((i) => i.branchId === branchId);
}
