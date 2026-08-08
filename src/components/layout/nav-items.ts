import type { LucideIcon } from "lucide-react";
import {
  LayoutList,
  PackagePlus,
  PackageMinus,
  ScrollText,
  Settings,
  ShoppingCart,
  Users,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const navItems: NavItem[] = [
  { href: "/materials", label: "Материалы", icon: LayoutList },
  { href: "/receipts", label: "Поступления", icon: PackagePlus },
  { href: "/issues", label: "Списания", icon: PackageMinus },
  { href: "/journal", label: "Журнал операций", icon: ScrollText },
  { href: "/purchase-list", label: "Требуется закупка", icon: ShoppingCart },
  { href: "/users", label: "Пользователи", icon: Users, adminOnly: true },
  { href: "/settings", label: "Настройки", icon: Settings, adminOnly: true },
];