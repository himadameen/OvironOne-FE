import { useMemo } from "react";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDemoStore } from "@/stores/demo-store";
import { useShopScope } from "@/hooks/use-shop-scope";
import { formatINR } from "@/lib/format";
import { toast } from "@/components/ui/use-toast";

export function ReportsPage() {
  const { tenantId, branchId } = useShopScope();
  const sales = useDemoStore((s) => s.sales);
  const products = useDemoStore((s) => s.products);

  const summary = useMemo(() => {
    const scoped = sales.filter(
      (s) => s.tenantId === tenantId && (!branchId || s.branchId === branchId)
    );
    const revenue = scoped.reduce((a, s) => a + s.total, 0);
    const skus = products.filter((p) => p.tenantId === tenantId).length;
    return { revenue, invoices: scoped.length, skus };
  }, [sales, products, tenantId, branchId]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="GST-ready exports and inventory snapshots."
        actions={
          <Button
            className="gap-2"
            onClick={() =>
              toast({ title: "Export started", description: "CSV downloaded (demo)." })
            }
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Sales register</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatINR(summary.revenue)}</p>
            <p className="text-xs text-muted-foreground">{summary.invoices} invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Stock valuation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{summary.skus} SKUs</p>
            <p className="text-xs text-muted-foreground">Cost value report</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">GSTR-1 summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">B2B + B2C</p>
            <p className="text-xs text-muted-foreground">Demo export ready</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
