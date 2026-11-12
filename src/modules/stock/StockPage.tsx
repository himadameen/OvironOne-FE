import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDemoStore } from "@/stores/demo-store";
import { useShopScope } from "@/hooks/use-shop-scope";
import { filterProducts } from "@/services/mock/productService";
import { formatINR } from "@/lib/format";

export function StockPage() {
  const navigate = useNavigate();
  const { tenantId, branchId } = useShopScope();
  const products = useDemoStore((s) => s.products);

  const list = useMemo(
    () => filterProducts(products, { tenantId, branchId, activeOnly: true }),
    [products, tenantId, branchId]
  );
  const low = list.filter((p) => p.stockQty <= p.reorderLevel);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock levels"
        description={`${low.length} SKUs need attention`}
        actions={
          <Button variant="outline" onClick={() => navigate("/app/stock/adjustments")}>
            Adjust stock
          </Button>
        }
      />
      {low.length ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 flex items-center gap-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          {low.length} items at or below reorder level
        </div>
      ) : null}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">On hand</TableHead>
              <TableHead className="text-right">Reorder</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.name}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={p.stockQty <= p.reorderLevel ? "destructive" : "secondary"}>
                    {p.stockQty} {p.unit}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{p.reorderLevel}</TableCell>
                <TableCell className="text-right">
                  {formatINR(p.stockQty * p.costPrice)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
