import { useMemo } from "react";
import { useSessionStore } from "@/stores/session-store";
import { useDemoStore } from "@/stores/demo-store";

export function useShopScope() {
  const tenantId = useSessionStore((s) => s.tenantId);
  const branchId = useSessionStore((s) => s.branchId);
  const demoRole = useSessionStore((s) => s.demoRole);
  const tenants = useDemoStore((s) => s.tenants);
  const branches = useDemoStore((s) => s.branches);

  const tenant = useMemo(
    () => tenants.find((t) => t.id === tenantId) ?? null,
    [tenants, tenantId]
  );
  const branch = useMemo(
    () => branches.find((b) => b.id === branchId) ?? null,
    [branches, branchId]
  );
  const tenantBranches = useMemo(
    () => branches.filter((b) => b.tenantId === tenantId),
    [branches, tenantId]
  );

  return { tenantId, branchId, demoRole, tenant, branch, tenantBranches, tenants };
}
