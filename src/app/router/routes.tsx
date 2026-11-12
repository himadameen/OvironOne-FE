import { Navigate, createBrowserRouter } from "react-router-dom";
import { LoginPage } from "@/modules/auth/LoginPage";
import { PlatformLayout } from "@/app/layouts/PlatformLayout";
import { ShopLayout } from "@/app/layouts/ShopLayout";
import { PlatformDashboardPage } from "@/modules/platform/PlatformDashboardPage";
import { ShopsPage } from "@/modules/platform/ShopsPage";
import { CreateShopWizardPage } from "@/modules/platform/CreateShopWizardPage";
import { SubscriptionsPage } from "@/modules/platform/SubscriptionsPage";
import { PlatformUsersPage } from "@/modules/platform/PlatformUsersPage";
import { AuditLogPage } from "@/modules/platform/AuditLogPage";
import { PlatformSettingsPage } from "@/modules/platform/PlatformSettingsPage";
import { ShopDashboardPage } from "@/modules/dashboard/ShopDashboardPage";
import { PosPage } from "@/modules/pos/PosPage";
import { ProductsPage } from "@/modules/products/ProductsPage";
import { SalesPage } from "@/modules/sales/SalesPage";
import { CustomersPage } from "@/modules/customers/CustomersPage";
import { CategoriesPage } from "@/modules/categories/CategoriesPage";
import { StockPage } from "@/modules/stock/StockPage";
import { StockAdjustmentsPage } from "@/modules/stock/StockAdjustmentsPage";
import { PurchasesPage } from "@/modules/purchases/PurchasesPage";
import { SuppliersPage } from "@/modules/suppliers/SuppliersPage";
import { EmployeesPage } from "@/modules/employees/EmployeesPage";
import { PaintersPage } from "@/modules/painters/PaintersPage";
import { ProjectsPage } from "@/modules/projects/ProjectsPage";
import { ReportsPage } from "@/modules/reports/ReportsPage";
import { AiAssistantPage } from "@/modules/ai/AiAssistantPage";
import { SettingsPage } from "@/modules/settings/SettingsPage";
import { MobileMorePage } from "@/modules/navigation/MobileMorePage";
import {
  AnalyticsPage,
  BarcodesPage,
  BranchTransfersPage,
  BrandingSettingsPage,
  BranchesPage,
  BrandsPage,
  CollectionsPage,
  CommissionManagementPage,
  CustomerLedgerPage,
  CustomerOutstandingPage,
  DailyCashbookPage,
  DeploymentSettingsPage,
  ExpensesPage,
  FinanceOverviewPage,
  GalleryPage,
  GoodsReceivedPage,
  InvestmentsPage,
  InvoiceSettingsPage,
  InvoicesPage,
  LowStockPage,
  PurchaseHistoryPage,
  QuotationsPage,
  RolesPermissionsPage,
  SalaryManagementPage,
  SalesReturnsPage,
  StockMovementsPage,
  SupplierLedgerPage,
  UsersPage,
} from "@/modules/shop-extension-pages";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "/login", element: <LoginPage /> },
  {
    path: "/platform",
    element: <PlatformLayout />,
    children: [
      { index: true, element: <PlatformDashboardPage /> },
      { path: "shops", element: <ShopsPage /> },
      { path: "shops/create", element: <CreateShopWizardPage /> },
      { path: "subscriptions", element: <SubscriptionsPage /> },
      { path: "users", element: <PlatformUsersPage /> },
      { path: "audit", element: <AuditLogPage /> },
      { path: "settings", element: <PlatformSettingsPage /> },
    ],
  },
  {
    path: "/app",
    element: <ShopLayout />,
    children: [
      { index: true, element: <Navigate to="/app/dashboard" replace /> },
      { path: "more", element: <MobileMorePage /> },
      { path: "dashboard", element: <ShopDashboardPage /> },
      { path: "pos", element: <PosPage /> },
      { path: "sales", element: <SalesPage /> },
      { path: "sales/returns", element: <SalesReturnsPage /> },
      { path: "invoices", element: <InvoicesPage /> },
      { path: "customers", element: <CustomersPage /> },
      { path: "customers/ledger", element: <CustomerLedgerPage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "categories", element: <CategoriesPage /> },
      { path: "brands", element: <BrandsPage /> },
      { path: "barcodes", element: <BarcodesPage /> },
      { path: "stock", element: <StockPage /> },
      { path: "stock/movements", element: <StockMovementsPage /> },
      { path: "stock/low", element: <LowStockPage /> },
      { path: "stock/adjustments", element: <StockAdjustmentsPage /> },
      { path: "stock/transfers", element: <BranchTransfersPage /> },
      { path: "purchases", element: <PurchasesPage /> },
      { path: "purchases/received", element: <GoodsReceivedPage /> },
      { path: "purchases/history", element: <PurchaseHistoryPage /> },
      { path: "suppliers", element: <SuppliersPage /> },
      { path: "painters", element: <PaintersPage /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "quotations", element: <QuotationsPage /> },
      { path: "gallery", element: <GalleryPage /> },
      { path: "finance", element: <FinanceOverviewPage /> },
      { path: "finance/cashbook", element: <DailyCashbookPage /> },
      { path: "finance/collections", element: <CollectionsPage /> },
      { path: "finance/expenses", element: <ExpensesPage /> },
      { path: "finance/investments", element: <InvestmentsPage /> },
      { path: "finance/supplier-ledger", element: <SupplierLedgerPage /> },
      { path: "finance/customer-outstanding", element: <CustomerOutstandingPage /> },
      { path: "employees", element: <EmployeesPage /> },
      { path: "employees/salary", element: <SalaryManagementPage /> },
      { path: "employees/commission", element: <CommissionManagementPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "analytics", element: <AnalyticsPage /> },
      { path: "ai", element: <AiAssistantPage /> },
      { path: "branches", element: <BranchesPage /> },
      { path: "users", element: <UsersPage /> },
      { path: "users/roles", element: <RolesPermissionsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "settings/branding", element: <BrandingSettingsPage /> },
      { path: "settings/invoice", element: <InvoiceSettingsPage /> },
      { path: "settings/deployment", element: <DeploymentSettingsPage /> },
    ],
  },
  { path: "*", element: <Navigate to="/login" replace /> },
]);
