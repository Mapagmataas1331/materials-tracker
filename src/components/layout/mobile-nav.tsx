"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { BrandFooter, BrandMasthead } from "@/components/layout/brand-chrome";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { cn } from "@/lib/utils";

export function MobileNav({
  isAdmin,
  purchaseListCount = 0,
}: {
  isAdmin: boolean;
  purchaseListCount?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative md:hidden")}
      >
        <Menu className="size-5" />
        {purchaseListCount > 0 && (
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />
        )}
        <span className="sr-only">Открыть меню</span>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-72 gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
        showCloseButton={false}
      >
        <SheetHeader className="h-16 justify-center border-b border-sidebar-border px-5 py-0">
          <BrandMasthead />
          <SheetTitle className="sr-only">Учёт материалов</SheetTitle>
        </SheetHeader>
        <SidebarNav
          isAdmin={isAdmin}
          purchaseListCount={purchaseListCount}
          onNavigate={() => setOpen(false)}
        />
        <BrandFooter className="mt-auto px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]" />
      </SheetContent>
    </Sheet>
  );
}
