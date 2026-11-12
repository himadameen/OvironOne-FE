import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  LogOut,
  RotateCcw,
  Settings2,
  ShoppingCart,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useShopScope } from "@/hooks/use-shop-scope";
import { useSessionStore } from "@/stores/session-store";
import { useDemoStore } from "@/stores/demo-store";
import { DEMO_SHOP_ROLES, type DemoRole } from "@/types/domain";
import { toast } from "@/components/ui/use-toast";

interface ShopHeaderBarProps {
  onOpenMobileNav?: () => void;
}

export function ShopHeaderBar({ onOpenMobileNav: _onOpenMobileNav }: ShopHeaderBarProps) {
  const navigate = useNavigate();
  const { tenant, branch, tenantBranches, tenants } = useShopScope();
  const demoRole = useSessionStore((s) => s.demoRole);
  const setTenantId = useSessionStore((s) => s.setTenantId);
  const setBranchId = useSessionStore((s) => s.setBranchId);
  const setDemoRole = useSessionStore((s) => s.setDemoRole);
  const loginAsShop = useSessionStore((s) => s.loginAsShop);
  const logout = useSessionStore((s) => s.logout);
  const resetDemo = useDemoStore((s) => s.resetDemo);
  const branches = useDemoStore((s) => s.branches);

  const onTenantChange = (tenantId: string) => {
    const primary = branches.find((b) => b.tenantId === tenantId && b.isPrimary);
    const branchId =
      primary?.id ?? branches.find((b) => b.tenantId === tenantId)?.id ?? "";
    loginAsShop(tenantId, branchId, demoRole);
    setTenantId(tenantId);
    if (primary) setBranchId(primary.id);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-card/90 backdrop-blur-md">
      <div className="flex h-14 items-center gap-3 px-4 lg:px-6">
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-semibold leading-tight">
            {tenant?.name ?? "Shop"}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {branch?.name ?? "Branch"} ·{" "}
            <span className="capitalize">{demoRole.replace(/_/g, " ")}</span>
          </p>
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <Button variant="maroon" size="sm" className="gap-1.5" asChild>
            <Link to="/app/pos">
              <ShoppingCart className="h-4 w-4" />
              POS
            </Link>
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 max-w-[160px] sm:max-w-none">
              <Store className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="hidden truncate sm:inline">Context</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Demo context
            </DropdownMenuLabel>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Shop</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {tenants.map((t) => (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => onTenantChange(t.id)}
                  >
                    {t.name}
                    {t.id === tenant?.id ? (
                      <Badge variant="secondary" className="ml-auto text-[10px]">
                        Active
                      </Badge>
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Branch</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {tenantBranches.map((b) => (
                  <DropdownMenuItem key={b.id} onClick={() => setBranchId(b.id)}>
                    {b.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs">Demo role</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={demoRole}
              onValueChange={(v) => setDemoRole(v as DemoRole)}
            >
              {DEMO_SHOP_ROLES.map((role) => (
                <DropdownMenuRadioItem key={role} value={role} className="capitalize">
                  {role.replace(/_/g, " ")}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                resetDemo();
                toast({ title: "Demo reset", description: "Seed data restored." });
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Reset demo data
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/app/settings">
                <Settings2 className="h-4 w-4" />
                Shop settings
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
