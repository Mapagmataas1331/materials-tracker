import { LogoIcon } from "@/components/icons/logo-icon";
import { requireUser } from "@/lib/current-user";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const isAdmin = user.role === "admin";

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4 font-semibold">
          <LogoIcon className="size-7 text-foreground" />
          Учёт материалов
        </div>
        <SidebarNav isAdmin={isAdmin} />
      </aside>
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-sm sm:px-4">
          <MobileNav isAdmin={isAdmin} />
          <div className="flex min-w-0 items-center gap-2 truncate font-semibold md:hidden">
            <LogoIcon className="size-7 shrink-0 text-foreground" />
            <span className="truncate">Учёт материалов</span>
          </div>
          <div className="ml-auto shrink-0">
            <UserMenu fullName={user.name ?? user.login} roleLabel={isAdmin ? "Администратор" : "Пользователь"} />
          </div>
        </header>
        <main className="flex-1 p-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-4 sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] md:p-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
