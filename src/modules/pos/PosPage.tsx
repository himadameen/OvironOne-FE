import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDemoStore } from "@/stores/demo-store";
import { useShopScope } from "@/hooks/use-shop-scope";
import { filterProducts } from "@/services/mock/productService";
import { formatINR } from "@/lib/format";
import { toast } from "@/components/ui/use-toast";
import type { SaleLine } from "@/types/domain";

interface CartLine extends SaleLine {
  maxStock: number;
}

export function PosPage() {
  const { tenantId, branchId, demoRole } = useShopScope();
  const products = useDemoStore((s) => s.products);
  const completeSale = useDemoStore((s) => s.completeSale);
  const customers = useDemoStore((s) => s.customers);

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [paymentMode, setPaymentMode] = useState<
    "cash" | "upi" | "card" | "credit" | "bank"
  >("upi");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [stockOverride, setStockOverride] = useState(false);

  const heldKey = `oviron-pos-held-${tenantId}`;

  const catalog = useMemo(
    () => filterProducts(products, { tenantId, branchId, search, activeOnly: true }),
    [products, tenantId, branchId, search]
  );

  const subtotal = cart.reduce((s, l) => s + l.lineTotal, 0);
  const taxable = Math.max(0, subtotal - discount);
  const tax = Math.round(taxable * 0.18 * 100) / 100;
  const total = taxable + tax;

  const addToCart = (productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (!p) return;
  const existing = cart.find((c) => c.productId === productId);
    if (existing) {
      if (existing.qty >= p.stockQty && !stockOverride) {
        toast({ variant: "destructive", title: "Insufficient stock" });
        return;
      }
      setCart(
        cart.map((c) =>
          c.productId === productId
            ? {
                ...c,
                qty: c.qty + 1,
                lineTotal: (c.qty + 1) * c.unitPrice,
              }
            : c
        )
      );
      return;
    }
    setCart([
      ...cart,
      {
        productId: p.id,
        productName: p.name,
        qty: 1,
        unitPrice: p.sellingPrice,
        lineTotal: p.sellingPrice,
        maxStock: p.stockQty,
      },
    ]);
  };

  const updateQty = (productId: string, delta: number) => {
    setCart(
      cart
        .map((c) => {
          if (c.productId !== productId) return c;
          const qty = c.qty + delta;
          if (qty <= 0) return null;
          if (qty > c.maxStock) return c;
          return { ...c, qty, lineTotal: qty * c.unitPrice };
        })
        .filter(Boolean) as CartLine[]
    );
  };

  const handleCheckout = () => {
    if (!tenantId || !branchId || cart.length === 0) return;
    const sale = completeSale({
      tenantId,
      branchId,
      customerName,
      lines: cart.map(({ maxStock: _m, ...line }) => line),
      discount,
      paymentMode: paymentMode === "bank" ? "upi" : paymentMode,
      soldBy: demoRole === "cashier" ? "Cashier" : "Store User",
      invoicePrefix: "POS",
      allowStockOverride: stockOverride || demoRole === "owner" || demoRole === "manager",
    });
    if (!sale) {
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: "Stock no longer available for one or more items.",
      });
      return;
    }
    toast({
      title: "Sale recorded",
      description: `${sale.invoiceNo} · ${formatINR(sale.total)}`,
    });
    setCart([]);
    setCheckoutOpen(false);
  };

  const tenantCustomers = customers.filter((c) => c.tenantId === tenantId);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Point of Sale"
        description="Scan-style billing with live stock checks."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!cart.length}
              onClick={() => {
                localStorage.setItem(heldKey, JSON.stringify(cart));
                setCart([]);
                toast({ title: "Bill on hold", description: "Resume when the customer returns." });
              }}
            >
              Hold bill
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const raw = localStorage.getItem(heldKey);
                if (!raw) {
                  toast({ title: "No held bill" });
                  return;
                }
                setCart(JSON.parse(raw) as CartLine[]);
                localStorage.removeItem(heldKey);
                toast({ title: "Held bill restored" });
              }}
            >
              Resume
            </Button>
            <Button
              disabled={!cart.length}
              onClick={() => setCheckoutOpen(true)}
              className="gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Checkout {cart.length ? `(${formatINR(total)})` : ""}
            </Button>
          </div>
        }
      />
      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <Input
              placeholder="Search SKU, brand, or scan barcode…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key !== "Enter" || !search.trim()) return;
                const q = search.trim().toLowerCase();
                const hit =
                  catalog.find((p) => p.sku.toLowerCase() === q) ??
                  catalog.find((p) => p.sku.replace(/-/g, "").toLowerCase() === q) ??
                  catalog[0];
                if (hit) {
                  addToCart(hit.id);
                  setSearch("");
                }
              }}
            />
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 max-h-[60vh] overflow-auto">
            {catalog.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addToCart(p.id)}
                disabled={p.stockQty < 1}
                className="text-left rounded-lg border p-3 hover:border-primary/50 hover:bg-accent/50 transition disabled:opacity-50"
              >
                <p className="font-medium text-sm line-clamp-2">{p.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{p.sku}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold text-primary">{formatINR(p.sellingPrice)}</span>
                  <Badge variant={p.stockQty <= p.reorderLevel ? "destructive" : "secondary"}>
                    {p.stockQty} {p.unit}
                  </Badge>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-display">Cart</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[50vh] overflow-auto">
            {!cart.length ? (
              <p className="text-sm text-muted-foreground text-center py-8">Tap products to add</p>
            ) : (
              cart.map((line) => (
                <div
                  key={line.productId}
                  className="flex gap-2 items-start border-b pb-3 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{line.productName}</p>
                    <p className="text-xs text-muted-foreground">{formatINR(line.unitPrice)} each</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(line.productId, -1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">{line.qty}</span>
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQty(line.productId, 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-destructive"
                    onClick={() => setCart(cart.filter((c) => c.productId !== line.productId))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Discount</span>
              <span>-{formatINR(discount)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>GST 18%</span>
              <span>{formatINR(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatINR(total)}</span>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete sale</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Customer</label>
              <Select
                value={customerName}
                onValueChange={setCustomerName}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Walk-in Customer">Walk-in Customer</SelectItem>
                  {tenantCustomers.map((c) => (
                    <SelectItem key={c.id} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Payment</label>
              <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v as typeof paymentMode)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank">Bank transfer</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Bill discount (₹)</label>
              <Input
                type="number"
                className="mt-1"
                min={0}
                value={discount || ""}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              />
            </div>
            {(demoRole === "owner" || demoRole === "manager") && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={stockOverride}
                  onChange={(e) => setStockOverride(e.target.checked)}
                />
                Authorise stock override (demo)
              </label>
            )}
            <p className="text-lg font-semibold text-center">{formatINR(total)}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleCheckout();
                window.print();
              }}
            >
              Confirm & print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
