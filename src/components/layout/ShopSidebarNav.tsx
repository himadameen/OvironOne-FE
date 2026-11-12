import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  filterNavByRole,
  shopQuickLinks,
  type ShopNavSection,
} from "@/app/navigation/shop-nav";
import type { DemoRole } from "@/types/domain";

function pathMatches(pathname: string, itemPath: string) {
  if (pathname === itemPath) return true;
  if (itemPath === "/app/dashboard" || itemPath === "/app/pos") return false;
  return pathname.startsWith(`${itemPath}/`);
}

function sectionIsActive(pathname: string, section: ShopNavSection) {
  return section.items.some((item) => pathMatches(pathname, item.path));
}

interface ShopSidebarNavProps {
  demoRole: DemoRole;
  compact?: boolean;
  onDark?: boolean;
  onNavigate?: () => void;
}

export function ShopSidebarNav({
  demoRole,
  compact,
  onDark = true,
  onNavigate,
}: ShopSidebarNavProps) {
  const { pathname } = useLocation();
  const navSections = useMemo(() => filterNavByRole(demoRole), [demoRole]);

  const menuSections = useMemo(
    () =>
      navSections.filter(
        (s) => s.title !== "Overview" && s.items.length > 0
      ),
    [navSections]
  );

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setOpenMenus((prev) => {
      const merged = { ...prev };
      for (const section of menuSections) {
        if (sectionIsActive(pathname, section)) {
          merged[section.title] = true;
        }
      }
      return merged;
    });
  }, [pathname, menuSections]);

  const toggle = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const allowedIds = new Set(
    navSections.flatMap((s) => s.items.map((i) => i.id))
  );
  const quickLinks = shopQuickLinks.filter((q) => allowedIds.has(q.id));

  const sectionLabel = onDark
    ? "text-[11px] font-semibold uppercase tracking-wide text-sidebar-muted"
    : "text-[11px] font-semibold uppercase tracking-wide text-muted-foreground";

  if (compact) {
    return (
      <nav className="flex flex-col items-center gap-2 py-2">
        {quickLinks.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            onClick={onNavigate}
            title={item.label}
            className={({ isActive }) =>
              cn(
                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                isActive
                  ? "bg-maroon text-maroon-foreground shadow-md"
                  : onDark
                    ? "text-sidebar-muted hover:bg-sidebar-border hover:text-sidebar-foreground"
                    : "text-muted-foreground hover:bg-muted"
              )
            }
          >
            <item.icon className="h-4 w-4" />
          </NavLink>
        ))}
        <NavLink
          to="/app/more"
          onClick={onNavigate}
          title="All menus"
          className={({ isActive }) =>
            cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              isActive
                ? "bg-primary text-primary-foreground"
                : onDark
                  ? "text-sidebar-muted hover:bg-sidebar-border"
                  : "text-muted-foreground hover:bg-muted"
            )
          }
        >
          <LayoutGrid className="h-4 w-4" />
        </NavLink>
      </nav>
    );
  }

  return (
    <nav className="space-y-5">
      <div>
        <p className={cn("mb-2 px-2", sectionLabel)}>Quick access</p>
        <ul className="space-y-1">
          {quickLinks.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? onDark
                        ? "bg-maroon text-maroon-foreground shadow-md"
                        : "bg-primary text-primary-foreground shadow-sm"
                      : onDark
                        ? "text-sidebar-foreground/85 hover:bg-sidebar-border hover:text-sidebar-foreground"
                        : "text-foreground/80 hover:bg-muted"
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0 opacity-90" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={cn(
          "h-px",
          onDark ? "bg-sidebar-border" : "bg-border"
        )}
      />

      <div>
        <p className={cn("mb-2 px-2", sectionLabel)}>Menus</p>
        <ul className="space-y-1">
          {menuSections.map((section) => {
            const open = openMenus[section.title] ?? false;
            const active = sectionIsActive(pathname, section);
            return (
              <li key={section.title}>
                <button
                  type="button"
                  onClick={() => toggle(section.title)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                    active && !open
                      ? onDark
                        ? "bg-sidebar-border/60 text-sidebar-foreground"
                        : "bg-muted text-foreground"
                      : onDark
                        ? "text-sidebar-foreground/90 hover:bg-sidebar-border/50"
                        : "text-foreground/90 hover:bg-muted/80"
                  )}
                >
                  <span>{section.title}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform duration-200",
                      onDark ? "text-sidebar-muted" : "text-muted-foreground",
                      open && "rotate-180"
                    )}
                  />
                </button>
                {open ? (
                  <ul
                    className={cn(
                      "mt-1 mb-2 ml-2 space-y-0.5 border-l pl-2",
                      onDark ? "border-sidebar-border" : "border-border"
                    )}
                  >
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <NavLink
                          to={item.path}
                          onClick={onNavigate}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center gap-2 rounded-md px-2.5 py-2 text-[13px] transition-colors",
                              isActive
                                ? onDark
                                  ? "bg-primary/25 font-medium text-white"
                                  : "bg-primary/10 font-medium text-primary"
                                : onDark
                                  ? "text-sidebar-muted hover:bg-sidebar-border/40 hover:text-sidebar-foreground"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )
                          }
                        >
                          <item.icon className="h-3.5 w-3.5 shrink-0" />
                          <span className="leading-snug">{item.label}</span>
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
