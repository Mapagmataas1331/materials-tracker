"use client";

import { signOut } from "next-auth/react";
import { ChevronDown, LogOut } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeMenuItems } from "@/components/layout/theme-menu-items";
import { ChangeOwnPasswordMenuItem } from "@/components/users/change-own-password-dialog";
import { cn } from "@/lib/utils";

function initials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function UserMenu({
  fullName,
  roleLabel,
}: {
  fullName: string;
  roleLabel: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "h-auto gap-2 px-1.5 py-1 sm:px-2"
        )}
      >
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/10 text-primary">{initials(fullName)}</AvatarFallback>
        </Avatar>
        <span className="hidden text-left text-sm leading-tight sm:block">
          <span className="block font-medium">{fullName}</span>
          <span className="block text-xs text-muted-foreground">{roleLabel}</span>
        </span>
        <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup className="sm:hidden">
          <DropdownMenuLabel>
            <span className="block font-medium text-foreground">{fullName}</span>
            <span className="block text-xs text-muted-foreground">{roleLabel}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <ThemeMenuItems />
        <DropdownMenuSeparator />
        <ChangeOwnPasswordMenuItem />
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="size-4" />
          Выйти
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
