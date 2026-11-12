import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { IndianRupee, Package, Receipt, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { KpiCard } from "@/components/shared/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useDemoStore } from "@/stores/demo-store";
import { useShopScope } from "@/hooks/use-shop-scope";
import { formatINR } from "@/lib/format";
import { useNavigate } from "react-router-dom";
import { filterProducts } from "@/services/mock/productService";

type Range = "7" | "30" | "90";

export function ShopDashboardPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState<Range>("30");
  const { tenantId, branchId, tenant, branch } = useShopScope();
  const sales = useDemoStore((s) => s.sales);
  const products = useDemoStore((s) => s.products);
  const stockMovements = useDemoStore((s) => s.stockMovements);

  const scopedSales = useMemo(
    () =>
      sales.filter(
        (s) =>
          s.tenantId === tenantId &&
          (!branchId || s.branchId === branchId) &&
          withinDays(s.soldAt, Number(range))
      ),
    [sales, tenantId, branchId, range]
  );

  const revenue = scopedSales.reduce((sum, s) => sum + s.total, 0);
  const invoiceCount = scopedSales.length;
  const scopedProducts = useMemo(
    () => filterProducts(products, { tenantId, branchId, activeOnly: true }),
    [products, tenantId, branchId]
  );
  const lowStock = scopedProducts.filter((p) => p.stockQty <= p.reorderLevel).length;

  const chartData = useMemo(() => buildDailyRevenue(scopedSales, Number(range)), [scopedSales, range]);

  const topProducts = useMemo(() => {
    const map = new Map<string, number>();
    scopedSales.forEach((s) =>
      s.lines.forEach((l) => map.set(l.productName, (map.get(l.productName) ?? 0) + l.lineTotal))
    );
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name: name.slice(0, 22), value }));
  }, [scopedSales]);

  const recentMoves = stockMovements
    .filter((m) => m.tenantId === tenantId)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title={tenant?.name ?? "Dashboard"}
        description={
          branch
            ? `${branch.name} · ${branch.city} — sales and inventory at a glance.`
            : "Your shop performance overview."
        }
        actions={
          <>
            <Select value={range} onValueChange={(v) => setRange(v as Range)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => navigate("/app/pos")}>Open POS</Button>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Revenue"
          value={formatINR(revenue, true)}
          icon={IndianRupee}
          trend={{ value: `${invoiceCount} invoices`, positive: true }}
        />
        <KpiCard
          title="Avg ticket"
          value={formatINR(invoiceCount ? revenue / invoiceCount : 0)}
          icon={Receipt}
        />
        <KpiCard
          title="SKU count"
          value={String(scopedProducts.length)}
          icon={Package}
          subtitle={`${lowStock} below reorder`}
        />
        <KpiCard
          title="Growth"
          value="+12.4%"
          icon={TrendingUp}
          trend={{ value: "vs prior period (demo)", positive: true }}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-display">Revenue trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="fillRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(175 84% 26%)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(175 84% 26%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(175 84% 26%)"
                  fill="url(#fillRev)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-display">Top products</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Bar dataKey="value" fill="hsl(36 78% 60%)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-display">Recent stock activity</CardTitle>
          <Button variant="link" className="px-0" onClick={() => navigate("/app/stock/adjustments")}>
            View all
          </Button>
        </CardHeader>
        <CardContent>
          <ul className="divide-y text-sm">
            {recentMoves.map((m) => (
              <li key={m.id} className="flex justify-between py-2 gap-4">
                <span>
                  {m.productName}{" "}
                  <span className="text-muted-foreground">({m.type})</span>
                </span>
                <span className={m.qtyDelta < 0 ? "text-destructive" : "text-emerald-600"}>
                  {m.qtyDelta > 0 ? "+" : ""}
                  {m.qtyDelta}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

function withinDays(iso: string, days: number): boolean {
  const t = new Date(iso).getTime();
  return Date.now() - t <= days * 86400000;
}

function buildDailyRevenue(sales: { soldAt: string; total: number }[], days: number) {
  const buckets: { label: string; revenue: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.push({
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      revenue: 0,
    });
    const bucket = buckets[buckets.length - 1];
    sales.forEach((s) => {
      if (s.soldAt.slice(0, 10) === key) bucket.revenue += s.total;
    });
  }
  if (sales.length && buckets.every((b) => b.revenue === 0)) {
    sales.forEach((s, idx) => {
      buckets[idx % buckets.length].revenue += s.total;
    });
  }
  return buckets;
}
