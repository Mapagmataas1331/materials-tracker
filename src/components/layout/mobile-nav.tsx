"use client";

import { useState } from "react";
import { Menu } from "lucide-react";

import { LogoIcon } from "@/components/icons/logo-icon";
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
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-destructive" />
        )}
        <span className="sr-only">Открыть меню</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0" showCloseButton={false}>
        <SheetHeader className="flex-row items-center gap-2 border-b px-4 py-3.5">
          <LogoIcon className="size-7 text-foreground" />
          <SheetTitle>Учёт материалов</SheetTitle>
        </SheetHeader>
        <SidebarNav
          isAdmin={isAdmin}
          purchaseListCount={purchaseListCount}
          onNavigate={() => setOpen(false)}
        />
      </SheetContent>
    </Sheet>
  );
}
