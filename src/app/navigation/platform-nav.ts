import type { LucideIcon } from "lucide-react";
import {
  Building2,
  CreditCard,
  LayoutDashboard,
  PlusCircle,
  ScrollText,
  Settings,
  Users,
} from "lucide-react";

export interface PlatformNavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface PlatformNavSection {
  title: string;
  items: PlatformNavItem[];
}

export const platformNavSections: PlatformNavSection[] = [
  {
    title: "Overview",
    items: [
      {
        id: "platform-dashboard",
        label: "Dashboard",
        path: "/platform",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Shops",
    items: [
      {
        id: "shops",
        label: "All Shops",
        path: "/platform/shops",
        icon: Building2,
      },
      {
        id: "create-shop",
        label: "Create Shop",
        path: "/platform/shops/create",
        icon: PlusCircle,
      },
    ],
  },
  {
    title: "Platform",
    items: [
      {
        id: "subscriptions",
        label: "Subscriptions",
        path: "/platform/subscriptions",
        icon: CreditCard,
      },
      {
        id: "platform-users",
        label: "Platform Users",
        path: "/platform/users",
        icon: Users,
      },
      {
        id: "audit-log",
        label: "Audit Log",
        path: "/platform/audit",
        icon: ScrollText,
      },
      {
        id: "platform-settings",
        label: "Settings",
        path: "/platform/settings",
        icon: Settings,
      },
    ],
  },
];

export const platformNavItems: PlatformNavItem[] =
  platformNavSections.flatMap((s) => s.items);
