import { useState } from "react";
import { Phone, UserPlus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDemoStore } from "@/stores/demo-store";
import { useShopScope } from "@/hooks/use-shop-scope";
import { formatINR } from "@/lib/format";
import { toast } from "@/components/ui/use-toast";
import { uid } from "@/types/domain";

export function CustomersPage() {
  const { tenantId } = useShopScope();
  const customers = useDemoStore((s) => s.customers);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const list = customers.filter((c) => c.tenantId === tenantId);

  const addCustomer = () => {
    if (!tenantId || !name.trim()) return;
    useDemoStore.setState((state) => ({
      customers: [
        ...state.customers,
        {
          id: uid("cust"),
          tenantId,
          name,
          phone,
          totalSpend: 0,
        },
      ],
    }));
    toast({ title: "Customer added" });
    setOpen(false);
    setName("");
    setPhone("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="CRM-lite for walk-ins and contractors."
        actions={
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Add customer
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <Card key={c.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display">{c.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                {c.phone}
              </p>
              <p>
                Lifetime spend:{" "}
                <span className="font-semibold text-primary">{formatINR(c.totalSpend)}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New customer</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input className="mt-1" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={addCustomer}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
