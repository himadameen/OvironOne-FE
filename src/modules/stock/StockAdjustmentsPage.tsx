import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDemoStore } from "@/stores/demo-store";
import { useShopScope } from "@/hooks/use-shop-scope";
import { filterProducts } from "@/services/mock/productService";
import { toast } from "@/components/ui/use-toast";

export function StockAdjustmentsPage() {
  const { tenantId, branchId } = useShopScope();
  const products = useDemoStore((s) => s.products);
  const stockMovements = useDemoStore((s) => s.stockMovements);
  const adjustStock = useDemoStore((s) => s.adjustStock);
  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("0");
  const [note, setNote] = useState("");

  const catalog = filterProducts(products, { tenantId, branchId, activeOnly: true });
  const adjustments = stockMovements.filter(
    (m) => m.tenantId === tenantId && m.type === "adjustment"
  );

  const submit = () => {
    const delta = Number(qty);
    if (!productId || !delta) return;
    const ok = adjustStock(productId, delta, note || undefined);
    toast(
      ok
        ? { title: "Stock adjusted", description: `${delta > 0 ? "+" : ""}${delta} units` }
        : { variant: "destructive", title: "Adjustment failed" }
    );
    if (ok) {
      setQty("0");
      setNote("");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock adjustments"
        description="Write-offs, corrections, and opening counts."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">New adjustment</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-end">
          <div className="sm:col-span-2">
            <Label>Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {catalog.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.stockQty})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Qty change (+/−)</Label>
            <Input className="mt-1" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
          </div>
          <Button onClick={submit}>Apply</Button>
          <div className="sm:col-span-4">
            <Label>Note</Label>
            <Input className="mt-1" value={note} onChange={(e) => setNote(e.target.value)} />
          </div>
        </CardContent>
      </Card>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adjustments.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.productName}</TableCell>
                <TableCell>{m.qtyDelta}</TableCell>
                <TableCell>{m.balanceAfter}</TableCell>
                <TableCell>{m.note ?? "—"}</TableCell>
                <TableCell>{new Date(m.createdAt).toLocaleString("en-IN")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
