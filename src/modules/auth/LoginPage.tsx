import { useNavigate } from "react-router-dom";
import { Building2, Paintbrush, Store, ToyBrick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OvironLogo } from "@/components/shared/OvironLogo";
import { PoweredByOviron } from "@/components/shared/PoweredByOviron";
import { useSessionStore } from "@/stores/session-store";

export function LoginPage() {
  const navigate = useNavigate();
  const loginAsPlatform = useSessionStore((s) => s.loginAsPlatform);
  const loginAsShop = useSessionStore((s) => s.loginAsShop);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[minmax(280px,42%)_1fr]">
      <aside className="relative flex flex-col justify-between bg-sidebar px-8 py-10 text-sidebar-foreground lg:min-h-screen">
        <div className="brand-accent-line absolute inset-x-0 top-0" />
        <div className="space-y-8 pt-4">
          <OvironLogo size="lg" showTagline onDark />
          <div className="space-y-3 max-w-sm">
            <p className="font-display text-2xl font-semibold leading-snug text-white">
              Retail management, refined.
            </p>
            <p className="text-sm leading-relaxed text-sidebar-muted">
              Billing, stock, finance, and branch performance in one white-label platform — demo-ready with realistic Indian shop data.
            </p>
          </div>
        </div>
        <PoweredByOviron onDark />
      </aside>

      <main className="flex flex-col justify-center bg-[hsl(var(--shell))] px-6 py-12 lg:px-14">
        <div className="mx-auto w-full max-w-lg space-y-8">
          <div className="lg:hidden">
            <OvironLogo size="md" showTagline />
          </div>

          <div className="grid gap-6">
            <Card className="overflow-hidden border-border/80">
              <div className="brand-accent-line" aria-hidden />
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  Platform admin
                </CardTitle>
                <CardDescription>
                  Manage shops, subscriptions, and onboarding.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    loginAsPlatform();
                    navigate("/platform");
                  }}
                >
                  Enter platform demo
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/80">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 font-display text-lg">
                  <Store className="h-5 w-5 text-maroon" />
                  Shop demos
                </CardTitle>
                <CardDescription>
                  Pre-loaded tenants with POS, inventory, and reports.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <ShopLoginRow
                  icon={Paintbrush}
                  title="Ambur Paint House"
                  subtitle="2 branches · Asian Paints & Berger"
                  onClick={() => {
                    loginAsShop("tenant-ambur", "branch-ambur-main", "owner");
                    navigate("/app/dashboard");
                  }}
                />
                <ShopLoginRow
                  icon={ToyBrick}
                  title="Toy House"
                  subtitle="Chennai Adyar · educational toys"
                  onClick={() => {
                    loginAsShop("tenant-toy", "branch-toy-adyar", "manager");
                    navigate("/app/dashboard");
                  }}
                />
                <ShopLoginRow
                  icon={Store}
                  title="Oviron Leather Store"
                  subtitle="Vaniyambadi · footwear & accessories"
                  onClick={() => {
                    loginAsShop("tenant-leather", "branch-leather-main", "owner");
                    navigate("/app/dashboard");
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function ShopLoginRow({
  icon: Icon,
  title,
  subtitle,
  onClick,
}: {
  icon: typeof Store;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl border border-border/80 bg-card px-4 py-3 text-left transition hover:border-primary/30 hover:bg-accent/50"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block font-display text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{subtitle}</span>
      </span>
    </button>
  );
}
