import { useState } from "react";
import { Mail } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useDemoStore } from "@/stores/demo-store";
import { useShopScope } from "@/hooks/use-shop-scope";

export function SuppliersPage() {
  const { tenantId } = useShopScope();
  const suppliers = useDemoStore((s) => s.suppliers);
  const [selected, setSelected] = useState<(typeof suppliers)[0] | null>(null);
  const list = suppliers.filter((s) => s.tenantId === tenantId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Distributors and wholesalers you buy from."
        actions={
          <Button variant="outline" className="gap-2" onClick={() => setSelected(list[0] ?? null)}>
            <Mail className="h-4 w-4" />
            Contact
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((s) => (
          <Card key={s.id} className="cursor-pointer hover:border-primary/40" onClick={() => setSelected(s)}>
            <CardHeader>
              <CardTitle className="text-base">{s.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {s.city} · {s.phone}
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.name}</DialogTitle>
          </DialogHeader>
          {selected ? (
            <p className="text-sm">
              GSTIN: {selected.gstin ?? "—"}
              <br />
              Phone: {selected.phone}
            </p>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
