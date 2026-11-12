export type DemoRole =
  | "owner"
  | "manager"
  | "cashier"
  | "stock_manager"
  | "accountant"
  | "project_manager"
  | "platform_admin";

export const DEMO_SHOP_ROLES: Exclude<DemoRole, "platform_admin">[] = [
  "owner",
  "manager",
  "cashier",
  "stock_manager",
  "accountant",
  "project_manager",
];

export type TenantKind = "paint" | "toys" | "leather" | "general";

export interface Tenant {
  id: string;
  name: string;
  kind: TenantKind;
  gstin?: string;
  city: string;
  state: string;
  phone: string;
  createdAt: string;
}

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  address: string;
  city: string;
  isPrimary: boolean;
}

export interface ProductCategory {
  id: string;
  tenantId: string;
  name: string;
}

export interface Product {
  id: string;
  tenantId: string;
  branchId: string;
  sku: string;
  name: string;
  brand?: string;
  categoryId: string;
  unit: string;
  mrp: number;
  sellingPrice: number;
  costPrice: number;
  stockQty: number;
  reorderLevel: number;
  isActive: boolean;
}

export interface Customer {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  email?: string;
  city?: string;
  gstin?: string;
  totalSpend: number;
  lastVisit?: string;
}

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  city: string;
  gstin?: string;
}

export interface Employee {
  id: string;
  tenantId: string;
  branchId: string;
  name: string;
  role: string;
  phone: string;
  joinedAt: string;
  isActive: boolean;
}

export interface Painter {
  id: string;
  tenantId: string;
  name: string;
  phone: string;
  specialty: string;
  rating: number;
  jobsCompleted: number;
}

export interface Project {
  id: string;
  tenantId: string;
  branchId: string;
  title: string;
  customerName: string;
  painterId?: string;
  status: "quoted" | "in_progress" | "completed";
  estimatedAmount: number;
  startDate?: string;
}

export interface SaleLine {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  tenantId: string;
  branchId: string;
  invoiceNo: string;
  customerId?: string;
  customerName: string;
  lines: SaleLine[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMode: "cash" | "upi" | "card" | "credit";
  soldAt: string;
  soldBy: string;
}

export interface PurchaseLine {
  productId: string;
  productName: string;
  qty: number;
  unitCost: number;
  lineTotal: number;
}

export interface Purchase {
  id: string;
  tenantId: string;
  branchId: string;
  billNo: string;
  supplierId: string;
  supplierName: string;
  lines: PurchaseLine[];
  total: number;
  purchasedAt: string;
}

export type StockMovementType = "sale" | "purchase" | "adjustment" | "transfer";

export interface StockMovement {
  id: string;
  tenantId: string;
  branchId: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  qtyDelta: number;
  balanceAfter: number;
  reference?: string;
  note?: string;
  createdAt: string;
}

export type PlatformShopStatus = "active" | "trial" | "suspended";

export interface PlatformShop {
  id: string;
  tenantId: string;
  shopName: string;
  ownerName: string;
  city: string;
  plan: "starter" | "growth" | "enterprise";
  status: PlatformShopStatus;
  mrr: number;
  joinedAt: string;
}

export interface DemoState {
  tenants: Tenant[];
  branches: Branch[];
  categories: ProductCategory[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  employees: Employee[];
  painters: Painter[];
  projects: Project[];
  sales: Sale[];
  purchases: Purchase[];
  stockMovements: StockMovement[];
  platformShops: PlatformShop[];
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
