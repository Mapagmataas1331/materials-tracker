"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { navItems } from "@/components/layout/nav-items";

export function SidebarNav({
  isAdmin,
  purchaseListCount = 0,
  onNavigate,
}: {
  isAdmin: boolean;
  purchaseListCount?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 p-3">
      <p className="caps-label px-3 pt-2 pb-2 text-[10px] text-sidebar-foreground/40">Разделы</p>
      {navItems
        .filter((item) => !item.adminOnly || isAdmin)
        .map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const showBadge = item.href === "/purchase-list" && purchaseListCount > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group relative flex min-h-10 min-w-0 items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:outline-none",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_6px_18px_-8px] shadow-brand-orange/60"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0",
                  !isActive && "text-sidebar-foreground/45 group-hover:text-brand-orange",
                )}
              />
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {showBadge && (
                <span
                  className={cn(
                    "shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none tabular-nums",
                    isActive
                      ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                      : "bg-brand-gold text-brand-black",
                  )}
                >
                  {purchaseListCount > 99 ? "99+" : purchaseListCount}
                </span>
              )}
            </Link>
          );
        })}
    </nav>
  );
}
