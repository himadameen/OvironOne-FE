import { useState } from "react";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDemoStore } from "@/stores/demo-store";
import { useShopScope } from "@/hooks/use-shop-scope";
import { formatINR } from "@/lib/format";
import type { Purchase } from "@/types/domain";
import { toast } from "@/components/ui/use-toast";

export function PurchasesPage() {
  const { tenantId, branchId } = useShopScope();
  const purchases = useDemoStore((s) => s.purchases);
  const [selected, setSelected] = useState<Purchase | null>(null);

  const list = purchases.filter(
    (p) => p.tenantId === tenantId && (!branchId || p.branchId === branchId)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchases"
        description="Supplier bills and inward stock."
        actions={
          <Button
            className="gap-2"
            onClick={() =>
              toast({ title: "Record purchase", description: "Demo PO workflow coming next sprint." })
            }
          >
            <FileText className="h-4 w-4" />
            Record bill
          </Button>
        }
      />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill No</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((p) => (
              <TableRow key={p.id} className="cursor-pointer" onClick={() => setSelected(p)}>
                <TableCell className="font-mono text-xs">{p.billNo}</TableCell>
                <TableCell>{p.supplierName}</TableCell>
                <TableCell>{new Date(p.purchasedAt).toLocaleDateString("en-IN")}</TableCell>
                <TableCell className="text-right font-medium">{formatINR(p.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.billNo}</DialogTitle>
          </DialogHeader>
          {selected ? (
            <ul className="text-sm space-y-1">
              {selected.lines.map((l) => (
                <li key={l.productId}>
                  {l.productName} × {l.qty} — {formatINR(l.lineTotal)}
                </li>
              ))}
            </ul>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
