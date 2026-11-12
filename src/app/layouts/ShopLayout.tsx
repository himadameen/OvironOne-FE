import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, PanelLeft, PanelLeftClose } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { OvironLogo } from "@/components/shared/OvironLogo";
import { shopMobileTabs } from "@/app/navigation/shop-nav";
import { useSessionStore } from "@/stores/session-store";
import { useShopScope } from "@/hooks/use-shop-scope";
import { ShopSidebarNav } from "@/components/layout/ShopSidebarNav";
import { ShopHeaderBar } from "@/components/layout/ShopHeaderBar";

export function ShopLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { tenant } = useShopScope();
  const sidebarCollapsed = useSessionStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useSessionStore((s) => s.toggleSidebar);
  const demoRole = useSessionStore((s) => s.demoRole);

  return (
    <div className="min-h-screen flex bg-[hsl(var(--shell))]">
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[inset_-1px_0_0_0_hsl(var(--sidebar-border))] transition-[width] duration-200",
          sidebarCollapsed ? "w-[76px]" : "w-[268px]"
        )}
      >
        <div className="brand-accent-line shrink-0" />
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
          {!sidebarCollapsed ? (
            <OvironLogo size="sm" onDark />
          ) : (
            <span className="mx-auto font-display text-sm font-bold text-white">O1</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={toggleSidebar}
            title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        <ScrollArea className="flex-1 px-3 py-4">
          <ShopSidebarNav
            demoRole={demoRole}
            compact={sidebarCollapsed}
            onDark
            onNavigate={() => setMobileOpen(false)}
          />
        </ScrollArea>
        {!sidebarCollapsed ? (
          <div className="border-t border-sidebar-border px-4 py-3 text-sidebar-muted">
            <p className="text-[10px]">
              Powered by <span className="text-sidebar-foreground font-medium">OVIRON</span>
            </p>
          </div>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-[4.25rem] lg:pb-0">
        <div className="flex h-14 items-center gap-2 border-b border-border/70 bg-card px-3 lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(100vw-3rem,300px)] p-0">
              <div className="border-b border-border/70 px-4 py-4">
                <OvironLogo showTagline size="sm" />
                <p className="mt-1 text-xs text-muted-foreground">{tenant?.name}</p>
              </div>
              <ScrollArea className="h-[calc(100vh-7rem)] px-3 py-4">
                <ShopSidebarNav
                  demoRole={demoRole}
                  onDark={false}
                  onNavigate={() => setMobileOpen(false)}
                />
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <OvironLogo size="sm" className="min-w-0 truncate" />
        </div>

        <ShopHeaderBar />

        <main className="flex-1">
          <div className="page-container animate-in-soft">
            <Outlet />
          </div>
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t border-border/80 bg-card/95 px-2 py-2 backdrop-blur-md lg:hidden">
        {shopMobileTabs.map((tab) => {
          const active =
            (tab.id === "home" && location.pathname === "/app/dashboard") ||
            (tab.id === "pos" && location.pathname.startsWith("/app/pos")) ||
            (tab.id === "stock" &&
              (location.pathname.startsWith("/app/stock") ||
                location.pathname.startsWith("/app/products"))) ||
            (tab.id === "more" &&
              (location.pathname === "/app/more" ||
                (!location.pathname.startsWith("/app/dashboard") &&
                  !location.pathname.startsWith("/app/pos") &&
                  !location.pathname.startsWith("/app/stock") &&
                  !location.pathname.startsWith("/app/products"))));

          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={cn(
                "flex min-w-[4.5rem] flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] transition-colors",
                active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground"
              )}
            >
              <tab.icon className={cn("h-5 w-5", active && "text-primary")} />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
