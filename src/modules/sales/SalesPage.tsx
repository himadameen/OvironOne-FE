import { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useDemoStore } from "@/stores/demo-store";
import { useShopScope } from "@/hooks/use-shop-scope";
import { formatINR } from "@/lib/format";
import type { Sale } from "@/types/domain";
import { useNavigate } from "react-router-dom";

export function SalesPage() {
  const navigate = useNavigate();
  const { tenantId, branchId } = useShopScope();
  const sales = useDemoStore((s) => s.sales);
  const [selected, setSelected] = useState<Sale | null>(null);

  const list = useMemo(
    () =>
      sales
        .filter(
          (s) => s.tenantId === tenantId && (!branchId || s.branchId === branchId)
        )
        .sort((a, b) => b.soldAt.localeCompare(a.soldAt)),
    [sales, tenantId, branchId]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales & invoices"
        description="Browse completed bills and payment modes."
        actions={<Button onClick={() => navigate("/app/pos")}>New sale</Button>}
      />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-mono text-xs">{s.invoiceNo}</TableCell>
                <TableCell>{s.customerName}</TableCell>
                <TableCell>{new Date(s.soldAt).toLocaleDateString("en-IN")}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="uppercase">
                    {s.paymentMode}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">{formatINR(s.total)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => setSelected(s)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.invoiceNo}</DialogTitle>
          </DialogHeader>
          {selected ? (
            <ul className="text-sm space-y-2">
              {selected.lines.map((l) => (
                <li key={l.productId} className="flex justify-between">
                  <span>
                    {l.productName} × {l.qty}
                  </span>
                  <span>{formatINR(l.lineTotal)}</span>
                </li>
              ))}
              <li className="flex justify-between font-bold border-t pt-2">
                <span>Total</span>
                <span>{formatINR(selected.total)}</span>
              </li>
            </ul>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
