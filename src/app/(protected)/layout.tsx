import { LogoLockup } from "@/components/icons/logo-icon";
import { requireUser } from "@/lib/current-user";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { BrandFooter, BrandMasthead, BrandStripe } from "@/components/layout/brand-chrome";
import { countPurchaseListItems } from "@/server/services/materials";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const isAdmin = user.role === "admin";
  const purchaseListCount = await countPurchaseListItems();

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:flex md:h-screen md:flex-col">
        <div className="flex h-16 min-w-0 items-center border-b border-sidebar-border px-5">
          <BrandMasthead />
        </div>
        <SidebarNav isAdmin={isAdmin} purchaseListCount={purchaseListCount} />
        <BrandFooter className="mt-auto px-5 pt-3 pb-5" />
      </aside>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex min-w-0 flex-col bg-background/90 backdrop-blur-sm">
          <BrandStripe className="md:hidden" />
          <div className="flex h-14 min-w-0 items-center gap-2 border-b border-border px-3 sm:px-4 md:h-16 md:px-6">
            <MobileNav isAdmin={isAdmin} purchaseListCount={purchaseListCount} />
            <div className="flex min-w-0 items-center gap-2.5 md:hidden">
              <LogoLockup className="h-3.5 text-foreground" title="Exomaterial" />
              <span className="sr-only">Учёт материалов</span>
            </div>
            <div className="ml-auto shrink-0">
              <UserMenu fullName={user.name ?? user.login} roleLabel={isAdmin ? "Администратор" : "Пользователь"} />
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-4 sm:pb-[max(1.5rem,env(safe-area-inset-bottom))] md:p-6 lg:p-8">
          <div className="mx-auto w-full min-w-0 max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
