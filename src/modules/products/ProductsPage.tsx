import { useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDemoStore } from "@/stores/demo-store";
import { useShopScope } from "@/hooks/use-shop-scope";
import { filterProducts } from "@/services/mock/productService";
import { formatINR } from "@/lib/format";
import { toast } from "@/components/ui/use-toast";
import type { Product } from "@/types/domain";
import { uid } from "@/types/domain";

const emptyForm = (): Partial<Product> => ({
  name: "",
  sku: "",
  brand: "",
  unit: "pc",
  mrp: 0,
  sellingPrice: 0,
  costPrice: 0,
  stockQty: 0,
  reorderLevel: 5,
  isActive: true,
});

export function ProductsPage() {
  const { tenantId, branchId } = useShopScope();
  const products = useDemoStore((s) => s.products);
  const categories = useDemoStore((s) => s.categories);
  const upsertProduct = useDemoStore((s) => s.upsertProduct);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>(emptyForm());

  const list = useMemo(
    () => filterProducts(products, { tenantId, branchId, search, activeOnly: false }),
    [products, tenantId, branchId, search]
  );

  const tenantCategories = categories.filter((c) => c.tenantId === tenantId);
  const defaultCategory = tenantCategories[0]?.id ?? "cat-interior";

  const openNew = () => {
    setEditing(null);
    setForm({ ...emptyForm(), categoryId: defaultCategory });
    setOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ ...p });
    setOpen(true);
  };

  const save = () => {
    if (!tenantId || !branchId || !form.name?.trim() || !form.sku?.trim()) {
      toast({ variant: "destructive", title: "Name and SKU required" });
      return;
    }
    const product: Product = {
      id: editing?.id ?? uid("prd"),
      tenantId,
      branchId,
      sku: form.sku!,
      name: form.name!,
      brand: form.brand,
      categoryId: form.categoryId ?? defaultCategory,
      unit: form.unit ?? "pc",
      mrp: Number(form.mrp) || 0,
      sellingPrice: Number(form.sellingPrice) || 0,
      costPrice: Number(form.costPrice) || 0,
      stockQty: Number(form.stockQty) || 0,
      reorderLevel: Number(form.reorderLevel) || 5,
      isActive: form.isActive ?? true,
    };
    upsertProduct(product);
    toast({ title: editing ? "Product updated" : "Product added" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description="Manage catalogue, pricing, and reorder levels."
        actions={
          <Button className="gap-2" onClick={openNew}>
            <Plus className="h-4 w-4" />
            Add product
          </Button>
        }
      />
      <Input
        placeholder="Search products…"
        className="max-w-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">MRP</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <div className="font-medium">{p.name}</div>
                  {p.brand ? (
                    <p className="text-xs text-muted-foreground">{p.brand}</p>
                  ) : null}
                </TableCell>
                <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                <TableCell className="text-right">{formatINR(p.mrp)}</TableCell>
                <TableCell className="text-right">{formatINR(p.sellingPrice)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={p.stockQty <= p.reorderLevel ? "destructive" : "secondary"}>
                    {p.stockQty} {p.unit}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "New product"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div>
              <Label>Name</Label>
              <Input
                className="mt-1"
                value={form.name ?? ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>SKU</Label>
                <Input
                  className="mt-1"
                  value={form.sku ?? ""}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />
              </div>
              <div>
                <Label>Brand</Label>
                <Input
                  className="mt-1"
                  value={form.brand ?? ""}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>MRP</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={form.mrp ?? 0}
                  onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Sell</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={form.sellingPrice ?? 0}
                  onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Cost</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={form.costPrice ?? 0}
                  onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={form.stockQty ?? 0}
                  onChange={(e) => setForm({ ...form, stockQty: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Reorder at</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={form.reorderLevel ?? 5}
                  onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={form.isActive ?? true}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
