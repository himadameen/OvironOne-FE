import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  BarChart3,
  Barcode,
  Bot,
  Building2,
  Calculator,
  ClipboardList,
  CreditCard,
  FileText,
  FolderKanban,
  GalleryHorizontal,
  Landmark,
  LayoutDashboard,
  LineChart,
  Package,
  Paintbrush,
  Receipt,
  RotateCcw,
  Settings,
  Shield,
  ShoppingBag,
  ShoppingCart,
  Store,
  Tags,
  Truck,
  Undo2,
  UserCog,
  Users,
  Wallet,
  Warehouse,
  Wrench,
  Percent,
} from "lucide-react";
import type { DemoRole } from "@/types/domain";

export interface ShopNavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  roles?: DemoRole[];
  mobileTab?: "home" | "pos" | "stock" | "more";
}

export interface ShopNavSection {
  title: string;
  items: ShopNavItem[];
}

const allRoles: DemoRole[] = ["owner", "manager", "cashier"];

export const shopNavSections: ShopNavSection[] = [
  {
    title: "Overview",
    items: [
      {
        id: "dashboard",
        label: "Dashboard",
        path: "/app/dashboard",
        icon: LayoutDashboard,
        mobileTab: "home",
      },
    ],
  },
  {
    title: "Sales",
    items: [
      {
        id: "pos",
        label: "POS Billing",
        path: "/app/pos",
        icon: ShoppingCart,
        mobileTab: "pos",
      },
      {
        id: "sales",
        label: "Sales History",
        path: "/app/sales",
        icon: Receipt,
        roles: allRoles,
      },
      {
        id: "sales-returns",
        label: "Sales Returns",
        path: "/app/sales/returns",
        icon: Undo2,
        roles: ["owner", "manager"],
      },
      {
        id: "invoices",
        label: "Invoices",
        path: "/app/invoices",
        icon: FileText,
      },
    ],
  },
  {
    title: "Catalogue",
    items: [
      {
        id: "products",
        label: "Products",
        path: "/app/products",
        icon: Package,
        mobileTab: "stock",
      },
      {
        id: "categories",
        label: "Categories",
        path: "/app/categories",
        icon: Tags,
      },
      {
        id: "brands",
        label: "Brands",
        path: "/app/brands",
        icon: Store,
      },
      {
        id: "barcodes",
        label: "Barcode Management",
        path: "/app/barcodes",
        icon: Barcode,
      },
    ],
  },
  {
    title: "Inventory",
    items: [
      {
        id: "stock",
        label: "Stock Overview",
        path: "/app/stock",
        icon: Warehouse,
        mobileTab: "stock",
      },
      {
        id: "stock-movements",
        label: "Stock Movements",
        path: "/app/stock/movements",
        icon: ArrowLeftRight,
      },
      {
        id: "low-stock",
        label: "Low Stock",
        path: "/app/stock/low",
        icon: ClipboardList,
      },
      {
        id: "stock-adjustments",
        label: "Stock Adjustments",
        path: "/app/stock/adjustments",
        icon: Wrench,
      },
      {
        id: "branch-transfers",
        label: "Branch Transfers",
        path: "/app/stock/transfers",
        icon: Truck,
      },
    ],
  },
  {
    title: "Purchasing",
    items: [
      {
        id: "purchases",
        label: "Purchase Orders",
        path: "/app/purchases",
        icon: ShoppingBag,
      },
      {
        id: "goods-received",
        label: "Goods Received",
        path: "/app/purchases/received",
        icon: Package,
      },
      {
        id: "suppliers",
        label: "Suppliers",
        path: "/app/suppliers",
        icon: Building2,
      },
      {
        id: "purchase-history",
        label: "Purchase History",
        path: "/app/purchases/history",
        icon: Receipt,
      },
    ],
  },
  {
    title: "Customers",
    items: [
      {
        id: "customers",
        label: "Customers",
        path: "/app/customers",
        icon: Users,
      },
      {
        id: "customer-ledger",
        label: "Customer Ledger",
        path: "/app/customers/ledger",
        icon: Wallet,
      },
      {
        id: "painters",
        label: "Painters & Contractors",
        path: "/app/painters",
        icon: Paintbrush,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        id: "projects",
        label: "Painting Projects",
        path: "/app/projects",
        icon: FolderKanban,
      },
      {
        id: "quotations",
        label: "Quotations",
        path: "/app/quotations",
        icon: FileText,
      },
      {
        id: "gallery",
        label: "Gallery",
        path: "/app/gallery",
        icon: GalleryHorizontal,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        id: "finance",
        label: "Finance Overview",
        path: "/app/finance",
        icon: Landmark,
        roles: ["owner", "manager"],
      },
      {
        id: "cashbook",
        label: "Daily Cashbook",
        path: "/app/finance/cashbook",
        icon: Calculator,
      },
      {
        id: "collections",
        label: "Collections",
        path: "/app/finance/collections",
        icon: CreditCard,
      },
      {
        id: "expenses",
        label: "Expenses",
        path: "/app/finance/expenses",
        icon: Receipt,
      },
      {
        id: "investments",
        label: "Investments",
        path: "/app/finance/investments",
        icon: LineChart,
      },
      {
        id: "supplier-ledger",
        label: "Supplier Ledger",
        path: "/app/finance/supplier-ledger",
        icon: Building2,
      },
      {
        id: "customer-outstanding",
        label: "Customer Outstanding",
        path: "/app/finance/customer-outstanding",
        icon: Users,
      },
    ],
  },
  {
    title: "People",
    items: [
      {
        id: "employees",
        label: "Employees",
        path: "/app/employees",
        icon: UserCog,
      },
      {
        id: "salary",
        label: "Salary Management",
        path: "/app/employees/salary",
        icon: Wallet,
      },
      {
        id: "commission",
        label: "Commission Management",
        path: "/app/employees/commission",
        icon: Percent,
      },
      {
        id: "roles",
        label: "Roles & Permissions",
        path: "/app/users/roles",
        icon: Shield,
      },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        id: "reports",
        label: "Reports",
        path: "/app/reports",
        icon: BarChart3,
      },
      {
        id: "analytics",
        label: "Analytics",
        path: "/app/analytics",
        icon: LineChart,
      },
      {
        id: "ai",
        label: "AI Business Assistant",
        path: "/app/ai",
        icon: Bot,
        mobileTab: "more",
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        id: "branches",
        label: "Branches",
        path: "/app/branches",
        icon: Building2,
      },
      {
        id: "users",
        label: "Users",
        path: "/app/users",
        icon: Users,
      },
      {
        id: "settings",
        label: "Shop Settings",
        path: "/app/settings",
        icon: Settings,
        mobileTab: "more",
      },
      {
        id: "branding",
        label: "Branding",
        path: "/app/settings/branding",
        icon: Paintbrush,
      },
      {
        id: "invoice-settings",
        label: "Invoice Settings",
        path: "/app/settings/invoice",
        icon: FileText,
      },
      {
        id: "deployment",
        label: "Deployment & Backup",
        path: "/app/settings/deployment",
        icon: RotateCcw,
      },
    ],
  },
];

/** Always-visible shortcuts — full modules live under collapsible Menus */
export const shopQuickLinks: ShopNavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/app/dashboard",
    icon: LayoutDashboard,
    mobileTab: "home",
  },
  {
    id: "pos",
    label: "POS Billing",
    path: "/app/pos",
    icon: ShoppingCart,
    mobileTab: "pos",
  },
  {
    id: "products",
    label: "Products",
    path: "/app/products",
    icon: Package,
    mobileTab: "stock",
  },
  {
    id: "stock",
    label: "Stock overview",
    path: "/app/stock",
    icon: Warehouse,
    mobileTab: "stock",
  },
];

export const shopNavItems: ShopNavItem[] = shopNavSections.flatMap(
  (s) => s.items
);

export const shopMobileTabs: {
  id: "home" | "pos" | "stock" | "more";
  label: string;
  path: string;
  icon: LucideIcon;
}[] = [
  {
    id: "home",
    label: "Home",
    path: "/app/dashboard",
    icon: LayoutDashboard,
  },
  { id: "pos", label: "POS", path: "/app/pos", icon: ShoppingCart },
  { id: "stock", label: "Stock", path: "/app/stock", icon: Warehouse },
  {
    id: "more",
    label: "More",
    path: "/app/more",
    icon: Settings,
  },
];

export function filterNavByRole(role: DemoRole): ShopNavSection[] {
  return shopNavSections
    .map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => !item.roles || item.roles.includes(role)
      ),
    }))
    .filter((section) => section.items.length > 0);
}
