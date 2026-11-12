import { useState } from "react";
import { FolderPlus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDemoStore } from "@/stores/demo-store";
import { useShopScope } from "@/hooks/use-shop-scope";
import { toast } from "@/components/ui/use-toast";
import { uid } from "@/types/domain";

export function CategoriesPage() {
  const { tenantId } = useShopScope();
  const categories = useDemoStore((s) => s.categories);
  const products = useDemoStore((s) => s.products);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  const list = categories.filter((c) => c.tenantId === tenantId);

  const save = () => {
    if (!tenantId || !name.trim()) return;
    useDemoStore.setState((s) => ({
      categories: [...s.categories, { id: uid("cat"), tenantId, name }],
    }));
    toast({ title: "Category created" });
    setOpen(false);
    setName("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organise catalogue for faster POS search."
        actions={
          <Button className="gap-2" onClick={() => setOpen(true)}>
            <FolderPlus className="h-4 w-4" />
            Add category
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {list.map((c) => {
          const count = products.filter((p) => p.categoryId === c.id).length;
          return (
            <Card key={c.id}>
              <CardHeader>
                <CardTitle className="text-base">{c.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {count} products
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
          </DialogHeader>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
          <DialogFooter>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
