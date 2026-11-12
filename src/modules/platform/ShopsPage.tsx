import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDemoStore } from "@/stores/demo-store";
import { formatINR } from "@/lib/format";

export function ShopsPage() {
  const navigate = useNavigate();
  const shops = useDemoStore((s) => s.platformShops);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<(typeof shops)[0] | null>(null);

  const filtered = shops.filter(
    (s) =>
      s.shopName.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="All shops"
        description="Tenants on OVIRON ONE with plan and billing status."
        actions={
          <Button className="gap-2" onClick={() => navigate("/platform/shops/create")}>
            <Plus className="h-4 w-4" />
            Create shop
          </Button>
        }
      />
      <div className="flex gap-2 max-w-md">
        <Input
          placeholder="Search shop or city…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Shop</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">MRR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((s) => (
              <TableRow
                key={s.id}
                className="cursor-pointer"
                onClick={() => setSelected(s)}
              >
                <TableCell>
                  <p className="font-medium">{s.shopName}</p>
                  <p className="text-xs text-muted-foreground">{s.city}</p>
                </TableCell>
                <TableCell>{s.ownerName}</TableCell>
                <TableCell className="capitalize">{s.plan}</TableCell>
                <TableCell>
                  <Badge variant={s.status === "active" ? "default" : "secondary"}>
                    {s.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">{formatINR(s.mrr)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.shopName}</DialogTitle>
          </DialogHeader>
          {selected ? (
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted-foreground">Owner</dt>
                <dd className="font-medium">{selected.ownerName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">City</dt>
                <dd className="font-medium">{selected.city}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Plan</dt>
                <dd className="font-medium capitalize">{selected.plan}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">MRR</dt>
                <dd className="font-medium">{formatINR(selected.mrr)}</dd>
              </div>
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
