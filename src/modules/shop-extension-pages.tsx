import { format } from "date-fns";
import { useMemo, useState } from "react";
import { RecordWorkspace } from "@/components/shared/RecordWorkspace";
import { Badge } from "@/components/ui/badge";
import { useDemoStore } from "@/stores/demo-store";
import { useShopScope } from "@/hooks/use-shop-scope";
import { formatINR } from "@/lib/format";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function useTenantScope() {
  const { tenantId, branchId, tenant, branch } = useShopScope();
  return { tenantId, branchId, tenant, branch };
}

export function SalesReturnsPage() {
  const { tenantId } = useTenantScope();
  const sales = useDemoStore((s) => s.sales);
  const rows = sales
    .filter((s) => s.tenantId === tenantId)
    .slice(0, 8)
    .map((s) => ({
      invoice: s.invoiceNo,
      customer: s.customerName,
      amount: s.total,
      status: "Eligible for demo return",
    }));

  return (
    <RecordWorkspace
      title="Sales Returns"
      description="Process full or partial sales returns. Returns update stock and collections in this demonstration."
      demoNote="Demonstration: return posting updates mock stock when confirmed."
      rows={rows}
      columns={[
        { key: "inv", header: "Invoice", cell: (r) => r.invoice },
        { key: "cust", header: "Customer", cell: (r) => r.customer },
        {
          key: "amt",
          header: "Amount",
          cell: (r) => formatINR(r.amount),
          className: "text-right",
        },
        {
          key: "status",
          header: "Status",
          cell: (r) => <Badge variant="secondary">{r.status}</Badge>,
        },
      ]}
      filterRow={(r, q) =>
        r.invoice.toLowerCase().includes(q) || r.customer.toLowerCase().includes(q)
      }
      primaryAction={{
        label: "New return",
        onClick: () =>
          toast({ title: "Return wizard", description: "Demo return form opened." }),
      }}
    />
  );
}

export function InvoicesPage() {
  const { tenantId } = useTenantScope();
  const sales = useDemoStore((s) => s.sales).filter((s) => s.tenantId === tenantId);

  return (
    <RecordWorkspace
      title="Invoices"
      description="GST invoice register with print-ready layouts."
      rows={sales}
      columns={[
        { key: "no", header: "Invoice #", cell: (r) => r.invoiceNo },
        {
          key: "date",
          header: "Date",
          cell: (r) => format(new Date(r.soldAt), "dd MMM yyyy"),
        },
        { key: "cust", header: "Customer", cell: (r) => r.customerName },
        {
          key: "pay",
          header: "Payment",
          cell: (r) => r.paymentMode.toUpperCase(),
        },
        {
          key: "total",
          header: "Total",
          cell: (r) => formatINR(r.total),
          className: "text-right",
        },
      ]}
      primaryAction={{
        label: "Print preview",
        onClick: () => window.print(),
      }}
      secondaryAction={{
        label: "Export CSV",
        onClick: () =>
          toast({ title: "Export", description: "Demo CSV download prepared." }),
      }}
    />
  );
}

export function BrandsPage() {
  const { tenantId } = useTenantScope();
  const products = useDemoStore((s) => s.products).filter((p) => p.tenantId === tenantId);
  const brands = useMemo(() => {
    const map = new Map<string, { brand: string; skus: number; stock: number; value: number }>();
    for (const p of products) {
      const brand = p.brand ?? "Unbranded";
      const row = map.get(brand) ?? { brand, skus: 0, stock: 0, value: 0 };
      row.skus += 1;
      row.stock += p.stockQty;
      row.value += p.stockQty * p.costPrice;
      map.set(brand, row);
    }
    return [...map.values()];
  }, [products]);

  return (
    <RecordWorkspace
      title="Brand performance"
      description="Investment, inventory and sales comparison by brand."
      kpis={[
        {
          label: "Brands tracked",
          value: String(brands.length),
        },
        {
          label: "Stock value",
          value: formatINR(brands.reduce((s, b) => s + b.value, 0), true),
        },
      ]}
      rows={brands}
      columns={[
        { key: "brand", header: "Brand", cell: (r) => r.brand },
        { key: "skus", header: "SKUs", cell: (r) => r.skus },
        { key: "stock", header: "Stock qty", cell: (r) => r.stock },
        {
          key: "value",
          header: "Stock value",
          cell: (r) => formatINR(r.value),
          className: "text-right",
        },
      ]}
      primaryAction={{
        label: "Brand detail",
        onClick: () => toast({ title: "Brand drill-down", description: "Demo view." }),
      }}
    />
  );
}

export function BarcodesPage() {
  const { tenantId } = useTenantScope();
  const products = useDemoStore((s) => s.products).filter((p) => p.tenantId === tenantId);

  return (
    <RecordWorkspace
      title="Barcode management"
      description="Generate and preview barcodes for billing and stock takes."
      demoNote="Barcode scan simulation is available on the POS screen."
      rows={products.slice(0, 40)}
      columns={[
        { key: "sku", header: "SKU", cell: (r) => r.sku },
        { key: "name", header: "Product", cell: (r) => r.name },
        {
          key: "barcode",
          header: "Barcode",
          cell: (r) => (
            <span className="font-mono text-xs">{r.sku.replace(/-/g, "")}</span>
          ),
        },
        {
          key: "print",
          header: "",
          cell: () => <Badge variant="outline">Preview</Badge>,
        },
      ]}
      primaryAction={{
        label: "Bulk print labels",
        onClick: () => toast({ title: "Label sheet", description: "Demo print layout." }),
      }}
    />
  );
}

export function StockMovementsPage() {
  const { tenantId, branchId } = useTenantScope();
  const movements = useDemoStore((s) => s.stockMovements).filter(
    (m) => m.tenantId === tenantId && m.branchId === branchId
  );

  return (
    <RecordWorkspace
      title="Stock movements"
      description="Complete audit trail of opening stock, purchases, sales, returns and transfers."
      rows={movements}
      columns={[
        {
          key: "date",
          header: "Date",
          cell: (r) => format(new Date(r.createdAt), "dd MMM yyyy HH:mm"),
        },
        { key: "product", header: "Product", cell: (r) => r.productName },
        { key: "type", header: "Type", cell: (r) => r.type },
        {
          key: "qty",
          header: "Qty Δ",
          cell: (r) => (
            <span className={r.qtyDelta < 0 ? "text-destructive" : "text-success"}>
              {r.qtyDelta > 0 ? "+" : ""}
              {r.qtyDelta}
            </span>
          ),
        },
        { key: "bal", header: "Balance", cell: (r) => r.balanceAfter },
        { key: "ref", header: "Reference", cell: (r) => r.reference ?? "—" },
      ]}
    />
  );
}

export function LowStockPage() {
  const { tenantId, branchId } = useTenantScope();
  const products = useDemoStore((s) => s.products).filter(
    (p) =>
      p.tenantId === tenantId &&
      p.branchId === branchId &&
      p.stockQty <= p.reorderLevel
  );

  return (
    <RecordWorkspace
      title="Low stock"
      description="Products at or below minimum stock levels for the selected branch."
      rows={products}
      columns={[
        { key: "name", header: "Product", cell: (r) => r.name },
        { key: "sku", header: "SKU", cell: (r) => r.sku },
        { key: "stock", header: "Current", cell: (r) => r.stockQty },
        { key: "min", header: "Minimum", cell: (r) => r.reorderLevel },
        {
          key: "status",
          header: "Status",
          cell: (r) => (
            <Badge variant={r.stockQty === 0 ? "destructive" : "warning"}>
              {r.stockQty === 0 ? "Out of stock" : "Reorder"}
            </Badge>
          ),
        },
      ]}
      primaryAction={{
        label: "Create purchase",
        onClick: () =>
          toast({ title: "Purchase", description: "Navigate to Purchases to order stock." }),
      }}
    />
  );
}

export function BranchTransfersPage() {
  const { tenant, branchId } = useTenantScope();
  const branches = useDemoStore((s) => s.branches).filter((b) => b.tenantId === tenant?.id);
  const rows = branches
    .filter((b) => b.id !== branchId)
    .map((b) => ({
      id: b.id,
      destination: b.name,
      status: "No pending transfer",
      items: 0,
    }));

  return (
    <RecordWorkspace
      title="Branch transfers"
      description="Move stock between branches with transfer references and confirmation."
      rows={rows}
      columns={[
        { key: "dest", header: "Destination", cell: (r) => r.destination },
        { key: "items", header: "Items", cell: (r) => r.items },
        { key: "status", header: "Status", cell: (r) => r.status },
      ]}
      primaryAction={{
        label: "New transfer",
        onClick: () =>
          toast({ title: "Transfer", description: "Demo transfer wizard." }),
      }}
    />
  );
}

export function GoodsReceivedPage() {
  const { tenantId } = useTenantScope();
  const purchases = useDemoStore((s) => s.purchases).filter((p) => p.tenantId === tenantId);

  return (
    <RecordWorkspace
      title="Goods received"
      description="Record GRN against purchase orders and update branch stock."
      rows={purchases}
      columns={[
        { key: "bill", header: "GRN / Bill", cell: (r) => r.billNo },
        { key: "sup", header: "Supplier", cell: (r) => r.supplierName },
        {
          key: "date",
          header: "Received",
          cell: (r) => format(new Date(r.purchasedAt), "dd MMM yyyy"),
        },
        {
          key: "total",
          header: "Value",
          cell: (r) => formatINR(r.total),
          className: "text-right",
        },
      ]}
      primaryAction={{
        label: "Receive goods",
        onClick: () => toast({ title: "GRN", description: "Demo goods receipt." }),
      }}
    />
  );
}

export function PurchaseHistoryPage() {
  return <GoodsReceivedPage />;
}

export function CustomerLedgerPage() {
  const { tenantId } = useTenantScope();
  const customers = useDemoStore((s) => s.customers).filter((c) => c.tenantId === tenantId);

  return (
    <RecordWorkspace
      title="Customer ledger"
      description="Sales, receipts and outstanding balances by customer."
      rows={customers}
      columns={[
        { key: "name", header: "Customer", cell: (r) => r.name },
        { key: "phone", header: "Phone", cell: (r) => r.phone },
        {
          key: "spend",
          header: "Total business",
          cell: (r) => formatINR(r.totalSpend),
          className: "text-right",
        },
        {
          key: "out",
          header: "Outstanding (demo)",
          cell: () => formatINR(0),
          className: "text-right",
        },
      ]}
      primaryAction={{
        label: "Record payment",
        onClick: () => toast({ title: "Collection", description: "Demo payment posted." }),
      }}
    />
  );
}

export function QuotationsPage() {
  const { tenantId } = useTenantScope();
  const projects = useDemoStore((s) => s.projects).filter((p) => p.tenantId === tenantId);

  return (
    <RecordWorkspace
      title="Quotations"
      description="Prepare painting and project quotations for customers."
      rows={projects}
      columns={[
        { key: "title", header: "Quotation", cell: (r) => r.title },
        { key: "cust", header: "Customer", cell: (r) => r.customerName },
        {
          key: "amt",
          header: "Value",
          cell: (r) => formatINR(r.estimatedAmount),
          className: "text-right",
        },
        { key: "status", header: "Status", cell: (r) => r.status },
      ]}
      primaryAction={{
        label: "New quotation",
        onClick: () => toast({ title: "Quotation", description: "Demo quote builder." }),
      }}
    />
  );
}

export function GalleryPage() {
  const items = [
    { title: "Exterior — Silk Glamour", category: "Projects" },
    { title: "Asian Paints shade card", category: "Products" },
    { title: "Invoice scan — Nov 2025", category: "Invoices" },
  ];

  return (
    <RecordWorkspace
      title="Gallery & documents"
      description="Product photos, project galleries and scanned documents (browser-local demo storage)."
      demoNote="Uploads are stored in memory / localStorage for demonstration only."
      rows={items}
      columns={[
        { key: "title", header: "Item", cell: (r) => r.title },
        { key: "cat", header: "Category", cell: (r) => r.category },
      ]}
      primaryAction={{
        label: "Upload (demo)",
        onClick: () => toast({ title: "Upload", description: "Demo file captured locally." }),
      }}
    />
  );
}

export function FinanceOverviewPage() {
  const { tenantId } = useTenantScope();
  const sales = useDemoStore((s) => s.sales).filter((x) => x.tenantId === tenantId);
  const revenue = sales.reduce((sum, s) => sum + s.total, 0);

  return (
    <RecordWorkspace
      title="Finance overview"
      description="Revenue, collections, payables and profit indicators."
      kpis={[
        { label: "Revenue (demo)", value: formatINR(revenue, true) },
        { label: "Collections", value: formatINR(revenue * 0.92, true), subtitle: "Including UPI & cash" },
        { label: "Expenses (demo)", value: formatINR(revenue * 0.18, true) },
        { label: "Gross profit", value: formatINR(revenue * 0.32, true) },
      ]}
      rows={sales.slice(0, 5).map((s) => ({
        label: s.invoiceNo,
        type: "Sale",
        amount: s.total,
      }))}
      columns={[
        { key: "label", header: "Reference", cell: (r) => r.label },
        { key: "type", header: "Type", cell: (r) => r.type },
        {
          key: "amount",
          header: "Amount",
          cell: (r) => formatINR(r.amount),
          className: "text-right",
        },
      ]}
    />
  );
}

export function DailyCashbookPage() {
  const [closeOpen, setCloseOpen] = useState(false);
  return (
    <>
      <RecordWorkspace
        title="Daily cashbook"
        description="Opening balance, cash movements and day-end closing with variance check."
        kpis={[
          { label: "Opening", value: formatINR(12500) },
          { label: "Cash in", value: formatINR(48200) },
          { label: "Cash out", value: formatINR(8400) },
          { label: "Expected close", value: formatINR(52300) },
        ]}
        rows={[
          { time: "09:30", part: "Sale — Walk-in", amount: 4200 },
          { time: "11:15", part: "Expense — Transport", amount: -600 },
        ]}
        columns={[
          { key: "time", header: "Time", cell: (r) => r.time },
          { key: "part", header: "Particulars", cell: (r) => r.part },
          {
            key: "amt",
            header: "Amount",
            cell: (r) => formatINR(r.amount),
            className: "text-right",
          },
        ]}
        primaryAction={{
          label: "Day closing",
          onClick: () => setCloseOpen(true),
        }}
      />
      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close cash day</DialogTitle>
          </DialogHeader>
          <Input placeholder="Actual closing balance (₹)" defaultValue="52250" />
          <p className="text-sm text-muted-foreground">Variance: ₹50 (demo)</p>
          <DialogFooter>
            <Button onClick={() => setCloseOpen(false)}>Confirm closing</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function CollectionsPage() {
  return (
    <RecordWorkspace
      title="Collections"
      description="Cash, UPI, card and bank collections recorded by branch."
      rows={[
        { mode: "UPI", branch: "Main", amount: 28500 },
        { mode: "Cash", branch: "Main", amount: 14200 },
        { mode: "Card", branch: "Branch 2", amount: 8600 },
      ]}
      columns={[
        { key: "mode", header: "Mode", cell: (r) => r.mode },
        { key: "branch", header: "Branch", cell: (r) => r.branch },
        {
          key: "amount",
          header: "Amount",
          cell: (r) => formatINR(r.amount),
          className: "text-right",
        },
      ]}
      primaryAction={{
        label: "Record collection",
        onClick: () => toast({ title: "Collection", description: "Demo entry saved." }),
      }}
    />
  );
}

export function ExpensesPage() {
  return (
    <RecordWorkspace
      title="Expenses"
      description="Rent, utilities, transport and shop expenses by category."
      rows={[
        { category: "Rent", note: "November", amount: 22000 },
        { category: "Electricity", note: "TNEB", amount: 4800 },
        { category: "Marketing", note: "Local ads", amount: 3500 },
      ]}
      columns={[
        { key: "cat", header: "Category", cell: (r) => r.category },
        { key: "note", header: "Note", cell: (r) => r.note },
        {
          key: "amt",
          header: "Amount",
          cell: (r) => formatINR(r.amount),
          className: "text-right",
        },
      ]}
      primaryAction={{
        label: "Add expense",
        onClick: () => toast({ title: "Expense", description: "Demo expense added." }),
      }}
    />
  );
}

export function InvestmentsPage() {
  return (
    <RecordWorkspace
      title="Investments & capital"
      description="Partner capital, loans and periodic investments tracked separately from revenue."
      rows={[
        { type: "Partner capital", period: "Apr 2025", amount: 500000 },
        { type: "Shop fit-out", period: "Jun 2025", amount: 180000 },
      ]}
      columns={[
        { key: "type", header: "Type", cell: (r) => r.type },
        { key: "period", header: "Period", cell: (r) => r.period },
        {
          key: "amt",
          header: "Amount",
          cell: (r) => formatINR(r.amount),
          className: "text-right",
        },
      ]}
    />
  );
}

export function SupplierLedgerPage() {
  const { tenantId } = useTenantScope();
  const suppliers = useDemoStore((s) => s.suppliers).filter((x) => x.tenantId === tenantId);
  const purchases = useDemoStore((s) => s.purchases).filter((x) => x.tenantId === tenantId);

  const rows = suppliers.map((s) => {
    const total = purchases
      .filter((p) => p.supplierId === s.id)
      .reduce((sum, p) => sum + p.total, 0);
    return { name: s.name, purchases: total, paid: total * 0.7, outstanding: total * 0.3 };
  });

  return (
    <RecordWorkspace
      title="Supplier ledger"
      description="Purchases, payments and outstanding supplier balances."
      rows={rows}
      columns={[
        { key: "name", header: "Supplier", cell: (r) => r.name },
        {
          key: "purchases",
          header: "Purchases",
          cell: (r) => formatINR(r.purchases),
          className: "text-right",
        },
        {
          key: "paid",
          header: "Paid",
          cell: (r) => formatINR(r.paid),
          className: "text-right",
        },
        {
          key: "out",
          header: "Outstanding",
          cell: (r) => formatINR(r.outstanding),
          className: "text-right",
        },
      ]}
      primaryAction={{
        label: "Pay supplier",
        onClick: () => toast({ title: "Payment", description: "Demo supplier payment." }),
      }}
    />
  );
}

export function CustomerOutstandingPage() {
  return (
    <RecordWorkspace
      title="Customer outstanding"
      description="Credit sales and pending customer collections."
      rows={[
        { customer: "Sharma Contractors", days: 18, amount: 24500 },
        { customer: "City Hardware", days: 7, amount: 8200 },
      ]}
      columns={[
        { key: "cust", header: "Customer", cell: (r) => r.customer },
        { key: "days", header: "Age (days)", cell: (r) => r.days },
        {
          key: "amt",
          header: "Outstanding",
          cell: (r) => formatINR(r.amount),
          className: "text-right",
        },
      ]}
      primaryAction={{
        label: "Send reminder (demo)",
        onClick: () => toast({ title: "Reminder", description: "Simulated SMS/WhatsApp." }),
      }}
    />
  );
}

export function SalaryManagementPage() {
  const { tenantId } = useTenantScope();
  const employees = useDemoStore((s) => s.employees).filter((e) => e.tenantId === tenantId);

  return (
    <RecordWorkspace
      title="Salary management"
      description="Monthly salary, advances, deductions and net payable."
      rows={employees.map((e) => ({
        name: e.name,
        role: e.role,
        salary: 18000,
        status: "Pending payout",
      }))}
      columns={[
        { key: "name", header: "Employee", cell: (r) => r.name },
        { key: "role", header: "Role", cell: (r) => r.role },
        {
          key: "salary",
          header: "Net payable",
          cell: (r) => formatINR(r.salary),
          className: "text-right",
        },
        { key: "status", header: "Status", cell: (r) => r.status },
      ]}
      primaryAction={{
        label: "Pay salary",
        onClick: () => toast({ title: "Salary", description: "Demo payout recorded." }),
      }}
    />
  );
}

export function CommissionManagementPage() {
  const { tenantId } = useTenantScope();
  const painters = useDemoStore((s) => s.painters).filter((p) => p.tenantId === tenantId);

  return (
    <RecordWorkspace
      title="Commission management"
      description="Painter and contractor commissions with ledger and payout dialogs."
      rows={painters.map((p) => ({
        name: p.name,
        earned: p.jobsCompleted * 850,
        paid: p.jobsCompleted * 600,
        outstanding: p.jobsCompleted * 250,
      }))}
      columns={[
        { key: "name", header: "Painter", cell: (r) => r.name },
        {
          key: "earned",
          header: "Earned",
          cell: (r) => formatINR(r.earned),
          className: "text-right",
        },
        {
          key: "paid",
          header: "Paid",
          cell: (r) => formatINR(r.paid),
          className: "text-right",
        },
        {
          key: "out",
          header: "Outstanding",
          cell: (r) => formatINR(r.outstanding),
          className: "text-right",
        },
      ]}
      primaryAction={{
        label: "Pay commission",
        onClick: () => toast({ title: "Commission", description: "Demo payout." }),
      }}
    />
  );
}

export function RolesPermissionsPage() {
  return (
    <RecordWorkspace
      title="Roles & permissions"
      description="Module-level access matrix for demonstration role switching."
      demoNote="Use the role switcher in the header to preview cashier, stock manager and accountant views."
      rows={[
        { module: "POS Billing", owner: "Full", cashier: "Full", accountant: "View" },
        { module: "Finance", owner: "Full", cashier: "—", accountant: "Full" },
        { module: "Stock adjustments", owner: "Full", cashier: "—", accountant: "View" },
      ]}
      columns={[
        { key: "module", header: "Module", cell: (r) => r.module },
        { key: "owner", header: "Owner", cell: (r) => r.owner },
        { key: "cashier", header: "Cashier", cell: (r) => r.cashier },
        { key: "accountant", header: "Accountant", cell: (r) => r.accountant },
      ]}
    />
  );
}

export function AnalyticsPage() {
  return (
    <RecordWorkspace
      title="Analytics"
      description="Interactive comparisons across sales, collections, inventory and branches."
      demoNote="Charts use the same mock dataset as the dashboard date filters."
      rows={[
        { metric: "Sales vs last month", value: "+12.4%" },
        { metric: "Collection efficiency", value: "94%" },
        { metric: "Slow movers", value: "6 SKUs" },
      ]}
      columns={[
        { key: "metric", header: "Insight", cell: (r) => r.metric },
        { key: "value", header: "Value", cell: (r) => r.value },
      ]}
      primaryAction={{
        label: "Open dashboard",
        onClick: () => (window.location.href = "/app/dashboard"),
      }}
    />
  );
}

export function BranchesPage() {
  const { tenantId } = useTenantScope();
  const branches = useDemoStore((s) => s.branches).filter((b) => b.tenantId === tenantId);

  return (
    <RecordWorkspace
      title="Branches"
      description="Branch profile, stock, sales and team performance."
      rows={branches}
      columns={[
        { key: "name", header: "Branch", cell: (r) => r.name },
        { key: "code", header: "Code", cell: (r) => r.code },
        { key: "city", header: "City", cell: (r) => r.city },
        {
          key: "primary",
          header: "Type",
          cell: (r) => (r.isPrimary ? "Primary" : "Branch"),
        },
      ]}
      primaryAction={{
        label: "Add branch (demo)",
        onClick: () => toast({ title: "Branch", description: "Demo branch wizard." }),
      }}
    />
  );
}

export function UsersPage() {
  return (
    <RecordWorkspace
      title="Users"
      description="Invite users, assign roles and branch access."
      rows={[
        { name: "Riyaz Ahmed", email: "owner@amburpaint.demo", role: "Owner" },
        { name: "Kavitha", email: "cashier@amburpaint.demo", role: "Cashier" },
      ]}
      columns={[
        { key: "name", header: "Name", cell: (r) => r.name },
        { key: "email", header: "Email", cell: (r) => r.email },
        { key: "role", header: "Role", cell: (r) => r.role },
      ]}
      primaryAction={{
        label: "Invite user",
        onClick: () => toast({ title: "Invite", description: "Demo invite sent." }),
      }}
    />
  );
}

export function BrandingSettingsPage() {
  return (
    <RecordWorkspace
      title="Branding"
      description="Logo, colours and white-label preview for your shop instance."
      rows={[
        { key: "Primary", value: "#0F766E" },
        { key: "Accent", value: "#E8A34A" },
      ]}
      columns={[
        { key: "key", header: "Setting", cell: (r) => r.key },
        { key: "value", header: "Value", cell: (r) => r.value },
      ]}
      primaryAction={{
        label: "Preview customer app",
        onClick: () => toast({ title: "Preview", description: "Branding applied in demo." }),
      }}
    />
  );
}

export function InvoiceSettingsPage() {
  return (
    <RecordWorkspace
      title="Invoice settings"
      description="GST, numbering, headers, footers and terms for print/PDF invoices."
      rows={[
        { key: "Prefix", value: "APH" },
        { key: "GSTIN", value: "33AAAAA0000A1Z5" },
        { key: "Terms", value: "Goods once sold will not be taken back." },
      ]}
      columns={[
        { key: "key", header: "Setting", cell: (r) => r.key },
        { key: "value", header: "Value", cell: (r) => r.value },
      ]}
    />
  );
}

export function DeploymentSettingsPage() {
  return (
    <RecordWorkspace
      title="Deployment & backup"
      description="Cloud vs local deployment information and demonstration backup status."
      demoNote="Backup and licence states are simulated for product demos only."
      rows={[
        { key: "Mode", value: "Cloud SaaS (demo)" },
        { key: "Version", value: "0.1.0-prototype" },
        { key: "Last backup", value: "Today, 02:00 IST (demo)" },
        { key: "Licence", value: "Growth plan — active (demo)" },
      ]}
      columns={[
        { key: "key", header: "Item", cell: (r) => r.key },
        { key: "value", header: "Status", cell: (r) => r.value },
      ]}
      primaryAction={{
        label: "Run backup (demo)",
        onClick: () => toast({ title: "Backup", description: "Simulated backup started." }),
      }}
    />
  );
}
