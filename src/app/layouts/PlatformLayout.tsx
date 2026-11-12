import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LogOut, PanelLeft, PanelLeftClose, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { OvironLogo } from "@/components/shared/OvironLogo";
import { platformNavSections } from "@/app/navigation/platform-nav";
import { useSessionStore } from "@/stores/session-store";
import { useDemoStore } from "@/stores/demo-store";
import { toast } from "@/components/ui/use-toast";

export function PlatformLayout() {
  const navigate = useNavigate();
  const sidebarCollapsed = useSessionStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useSessionStore((s) => s.toggleSidebar);
  const logout = useSessionStore((s) => s.logout);
  const resetDemo = useDemoStore((s) => s.resetDemo);

  return (
    <div className="min-h-screen flex bg-[hsl(var(--shell))]">
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all",
          sidebarCollapsed ? "w-[72px]" : "w-60"
        )}
      >
        <div className="brand-accent-line shrink-0" />
        <div className="flex h-14 items-center border-b border-sidebar-border px-4 justify-between gap-2">
          <OvironLogo size="sm" onDark className={sidebarCollapsed ? "mx-auto" : ""} />
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground hover:bg-sidebar-border"
            onClick={toggleSidebar}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        <ScrollArea className="flex-1 p-3">
          <nav className="space-y-6">
            {platformNavSections.map((section) => (
              <div key={section.title}>
                {!sidebarCollapsed ? (
                  <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-muted">
                    {section.title}
                  </p>
                ) : null}
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <NavLink
                        to={item.path}
                        end={item.path === "/platform"}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-border",
                            isActive
                              ? "bg-maroon text-maroon-foreground shadow-sm"
                              : "text-sidebar-muted hover:text-sidebar-foreground",
                            sidebarCollapsed && "justify-center px-2"
                          )
                        }
                        title={sidebarCollapsed ? item.label : undefined}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!sidebarCollapsed ? <span>{item.label}</span> : null}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </ScrollArea>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b bg-card px-4">
          <span className="font-display font-semibold md:hidden">
            <OvironLogo size="sm" />
          </span>
          <span className="hidden md:inline font-display font-semibold">
            <span className="text-primary">Platform</span>
            <span className="text-muted-foreground font-normal"> admin</span>
          </span>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => {
              resetDemo();
              toast({ title: "Demo reset", description: "All shop seed data restored." });
            }}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset demo
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </header>
        <main className="flex-1">
          <div className="page-container animate-in-soft max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
