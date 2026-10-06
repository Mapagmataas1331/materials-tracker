import { LogoIcon, LogoLockup, LogoWordmark } from "@/components/icons/logo-icon";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; passwordChanged?: string }>;
}) {
  const { callbackUrl, passwordChanged } = await searchParams;

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* Brand panel — composition follows the guide cover (p.1): orange field, giant wordmark, caps title */}
      <section
        aria-hidden
        className="relative hidden overflow-hidden bg-brand-orange text-white lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16"
      >
        <LogoWordmark className="h-auto w-full max-w-[44rem]" />
        <LogoIcon className="pointer-events-none absolute -right-24 bottom-28 w-[30rem] text-brand-black xl:w-[36rem]" />
        <div className="relative flex items-end justify-between gap-8">
          <div className="space-y-4">
            <p className="font-heading text-5xl leading-[0.95] font-extrabold uppercase xl:text-6xl">
              Учёт
              <br />
              материалов
            </p>
            <p className="display-text text-sm text-white/85">Задумай невозможное</p>
          </div>
          <p className="caps-label max-w-[12rem] text-right text-[11px] leading-snug text-white/85">
            Внутренняя система
            <br />
            учёта на производстве
          </p>
        </div>
      </section>

      <div className="flex flex-col">
        <div className="brand-stripe lg:hidden" aria-hidden />
        <div className="flex flex-1 items-center justify-center px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-8">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-5">
              <LogoLockup className="h-6 text-foreground" title="Exomaterial" />
              <div className="space-y-2">
                <p className="section-kicker">Вход в систему</p>
                <h1 className="page-title text-foreground">Учёт материалов</h1>
                <p className="text-sm text-muted-foreground">
                  Внутренняя система учёта материалов на производстве
                </p>
              </div>
            </div>
            {passwordChanged === "1" && (
              <p
                role="status"
                className="rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success"
              >
                Пароль успешно изменён. Войдите с новым паролем.
              </p>
            )}
            <LoginForm callbackUrl={callbackUrl} />
            <p className="display-text text-[10px] text-muted-foreground lg:hidden">
              Задумай невозможное
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
