import { useRef, useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useShopScope } from "@/hooks/use-shop-scope";
import { useDemoStore } from "@/stores/demo-store";
import { filterProducts } from "@/services/mock/productService";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}

function replyForPrompt(
  prompt: string,
  ctx: { shopName: string; lowStock: number; revenue: number; topSku?: string }
): string {
  const q = prompt.toLowerCase();
  if (q.includes("stock") || q.includes("reorder")) {
    return `You have ${ctx.lowStock} SKUs at or below reorder level at ${ctx.shopName}. I recommend raising POs for Asian Paints fast-movers and reviewing warehouse branch transfers.`;
  }
  if (q.includes("sales") || q.includes("revenue")) {
    return `Recent recorded revenue for this branch is about ${formatINR(ctx.revenue)}. Peak hours in demo data are 10am–1pm and 5pm–8pm. Consider a bundle offer on ${ctx.topSku ?? "top sellers"}.`;
  }
  if (q.includes("gst") || q.includes("tax")) {
    return "Demo GST is modeled at 18% on taxable value. Ensure HSN-wise summary is exported before the 11th for GSTR-1 filing.";
  }
  if (q.includes("painter") || q.includes("project")) {
    return "Murugan & Team has the highest rating (4.8) with 142 completed jobs. Two open paint projects are in progress — follow up on material dispatch from warehouse.";
  }
  return `Got it. For ${ctx.shopName}, I can help with stock, sales trends, GST exports, and painter assignments. Try asking "Which items need reorder?" or "Summarise this week's sales".`;
}

export function AiAssistantPage() {
  const { tenant, branch, tenantId, branchId } = useShopScope();
  const products = useDemoStore((s) => s.products);
  const sales = useDemoStore((s) => s.sales);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: `Hi! I'm your OVIRON assistant for ${tenant?.name ?? "your shop"}. Ask about stock, sales, or GST — responses are deterministic demo data.`,
    },
  ]);
  const endRef = useRef<HTMLDivElement>(null);

  const scopedProducts = filterProducts(products, { tenantId, branchId, activeOnly: true });
  const lowStock = scopedProducts.filter((p) => p.stockQty <= p.reorderLevel).length;
  const scopedSales = sales.filter(
    (s) => s.tenantId === tenantId && (!branchId || s.branchId === branchId)
  );
  const revenue = scopedSales.reduce((sum, s) => sum + s.total, 0);
  const topSku = scopedProducts.sort((a, b) => b.stockQty - a.stockQty)[0]?.name;

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: "user", text };
    const answer: ChatMessage = {
      id: `a-${Date.now()}`,
      role: "assistant",
      text: replyForPrompt(text, {
        shopName: tenant?.name ?? "your shop",
        lowStock,
        revenue,
        topSku,
      }),
    };
    setMessages((m) => [...m, userMsg, answer]);
    setInput("");
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const suggestions = [
    "Which items need reorder?",
    "Summarise recent sales",
    "GST filing checklist",
    "Painter availability",
  ];

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-8rem)] max-h-[800px]">
      <PageHeader
        title="AI Assistant"
        description={`Context: ${branch?.name ?? "All branches"} · deterministic demo replies.`}
        actions={
          <Button variant="outline" size="sm" className="gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            Insights
          </Button>
        }
      />
      <Card className="flex-1 flex flex-col min-h-0">
        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-4 max-w-2xl">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={cn(
                    "flex gap-3",
                    m.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {m.role === "assistant" ? (
                    <div className="rounded-full bg-primary/10 p-2 h-fit">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  ) : null}
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm max-w-[85%]",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
          </ScrollArea>
          <div className="border-t p-3 space-y-2">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <Button
                  key={s}
                  variant="secondary"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => {
                    setInput(s);
                  }}
                >
                  {s}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea
                rows={2}
                placeholder="Ask about stock, sales, painters…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
              />
              <Button size="icon" className="shrink-0 h-auto" onClick={send}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
