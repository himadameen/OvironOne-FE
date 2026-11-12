import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useDemoStore } from "@/stores/demo-store";
import { formatINR } from "@/lib/format";
import { toast } from "@/components/ui/use-toast";

export function SubscriptionsPage() {
  const shops = useDemoStore((s) => s.platformShops);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscriptions"
        description="Plans, trials, and MRR across the network."
        actions={
          <Button onClick={() => toast({ title: "Plan catalog", description: "Edit plans in settings." })}>
            Manage plans
          </Button>
        }
      />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shop</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">MRR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shops.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.shopName}</TableCell>
                <TableCell className="capitalize">{s.plan}</TableCell>
                <TableCell>
                  <Badge>{s.status}</Badge>
                </TableCell>
                <TableCell className="text-right">{formatINR(s.mrr)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
