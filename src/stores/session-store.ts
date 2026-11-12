import { create } from "zustand";
import { loadJson, saveJson } from "@/lib/storage";
import type { DemoRole } from "@/types/domain";

const SESSION_PREFS_KEY = "oviron-one-session-prefs";

interface SessionPrefs {
  tenantId: string | null;
  branchId: string | null;
  demoRole: DemoRole;
  sidebarCollapsed: boolean;
}

interface SessionStore extends SessionPrefs {
  setTenantId: (tenantId: string | null) => void;
  setBranchId: (branchId: string | null) => void;
  setDemoRole: (role: DemoRole) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  loginAsPlatform: () => void;
  loginAsShop: (tenantId: string, branchId: string, role?: DemoRole) => void;
  logout: () => void;
  isPlatformSession: boolean;
}

const defaultPrefs: SessionPrefs = {
  tenantId: "tenant-ambur",
  branchId: "branch-ambur-main",
  demoRole: "owner",
  sidebarCollapsed: false,
};

export const useSessionStore = create<SessionStore>()((set, get) => ({
  ...loadJson<SessionPrefs>(SESSION_PREFS_KEY, defaultPrefs),
  isPlatformSession: false,
  setTenantId: (tenantId) => {
    set({ tenantId, isPlatformSession: false });
    persistPrefs(get());
  },
  setBranchId: (branchId) => {
    set({ branchId });
    persistPrefs(get());
  },
  setDemoRole: (demoRole) => {
    set({ demoRole });
    persistPrefs(get());
  },
  setSidebarCollapsed: (sidebarCollapsed) => {
    set({ sidebarCollapsed });
    persistPrefs(get());
  },
  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    set({ sidebarCollapsed: next });
    persistPrefs(get());
  },
  loginAsPlatform: () => {
    set({
      isPlatformSession: true,
      demoRole: "platform_admin",
      tenantId: null,
      branchId: null,
    });
    persistPrefs(get());
  },
  loginAsShop: (tenantId, branchId, role = "owner") => {
    set({
      isPlatformSession: false,
      tenantId,
      branchId,
      demoRole: role,
    });
    persistPrefs(get());
  },
  logout: () => {
    set({
      isPlatformSession: false,
      tenantId: defaultPrefs.tenantId,
      branchId: defaultPrefs.branchId,
      demoRole: "owner",
    });
    persistPrefs(get());
  },
}));

function persistPrefs(state: SessionStore): void {
  saveJson<SessionPrefs>(SESSION_PREFS_KEY, {
    tenantId: state.tenantId,
    branchId: state.branchId,
    demoRole: state.demoRole,
    sidebarCollapsed: state.sidebarCollapsed,
  });
}
