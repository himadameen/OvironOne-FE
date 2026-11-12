import { useMemo, useState, type ComponentType } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Search } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Input } from "@/components/ui/input";
import {
  filterNavByRole,
  shopQuickLinks,
  type ShopNavSection,
} from "@/app/navigation/shop-nav";
import { useSessionStore } from "@/stores/session-store";
import { cn } from "@/lib/utils";

export function MobileMorePage() {
  const demoRole = useSessionStore((s) => s.demoRole);
  const { pathname } = useLocation();
  const [query, setQuery] = useState("");
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const sections = useMemo(() => filterNavByRole(demoRole), [demoRole]);
  const menuSections = useMemo(
    () => sections.filter((s) => s.title !== "Overview"),
    [sections]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return menuSections;
    return menuSections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.label.toLowerCase().includes(q) ||
            section.title.toLowerCase().includes(q)
        ),
      }))
      .filter((s) => s.items.length > 0);
  }, [menuSections, query]);

  const allowedIds = new Set(sections.flatMap((s) => s.items.map((i) => i.id)));
  const quick = shopQuickLinks.filter((q) => allowedIds.has(q.id));

  const toggle = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Menus"
        description="Open any module by menu. Use search to filter."
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9 h-11"
          placeholder="Search modules…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {!query && quick.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {quick.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "flex flex-col gap-2 rounded-xl border bg-card p-4 text-sm font-medium shadow-sm transition active:scale-[0.98]",
                pathname === item.path
                  ? "border-primary/40 bg-primary/5 text-primary"
                  : "hover:border-border"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}

      <div className="space-y-2">
        {filtered.map((section) => (
          <MenuAccordion
            key={section.title}
            section={section}
            pathname={pathname}
            open={query ? true : openMenus[section.title] ?? section.items.some((i) => i.path === pathname)}
            onToggle={() => toggle(section.title)}
            forceOpen={Boolean(query)}
          />
        ))}
      </div>
    </div>
  );
}

function MenuAccordion({
  section,
  pathname,
  open,
  onToggle,
  forceOpen,
}: {
  section: ShopNavSection;
  pathname: string;
  open: boolean;
  onToggle: () => void;
  forceOpen: boolean;
}) {
  const isOpen = forceOpen || open;
  const hasActive = section.items.some((i) => i.path === pathname);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-card",
        hasActive && "border-primary/30"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold"
      >
        {section.title}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen ? (
        <ul className="border-t px-2 pb-2 pt-1">
          {section.items.map((item) => (
            <li key={item.id}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                  pathname === item.path
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <ItemIcon icon={item.icon} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ItemIcon({
  icon: Icon,
}: {
  icon: ComponentType<{ className?: string }>;
}) {
  return <Icon className="h-4 w-4 shrink-0 opacity-80" />;
}
