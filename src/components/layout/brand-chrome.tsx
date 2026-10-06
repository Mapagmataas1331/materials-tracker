import { LogoIcon, LogoLockup } from "@/components/icons/logo-icon";
import { cn } from "@/lib/utils";

/** Sidebar / sheet masthead: official lockup + product name in brand caps. */
export function BrandMasthead({ className }: { className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col justify-center gap-1.5", className)}>
      <LogoLockup className="h-[15px] text-white" title="Exomaterial" />
      <span className="caps-label truncate text-[11px] text-sidebar-foreground/60">
        Учёт материалов
      </span>
    </div>
  );
}

/** Sidebar footer: brand accent stripe + slogan (brand guide «Слоган»). */
export function BrandFooter({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="brand-stripe w-full rounded-full" aria-hidden />
      <div className="flex items-center justify-between gap-3">
        <p className="display-text text-[9px] leading-tight text-sidebar-foreground/55">
          Задумай
          <br />
          невозможное
        </p>
        <LogoIcon className="w-8 text-brand-orange" />
      </div>
    </div>
  );
}

/** Thin multi-accent bar, used on top of the app header. */
export function BrandStripe({ className }: { className?: string }) {
  return <div className={cn("brand-stripe w-full", className)} aria-hidden />;
}
