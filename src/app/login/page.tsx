import { LogoIcon } from "@/components/icons/logo-icon";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; passwordChanged?: string }>;
}) {
  const { callbackUrl, passwordChanged } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <LogoIcon className="size-14" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Учёт материалов</h1>
          <p className="text-sm text-muted-foreground">
            Внутренняя система учёта материалов на производстве
          </p>
        </div>
        {passwordChanged === "1" && (
          <p
            role="status"
            className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-center text-sm text-success-foreground"
          >
            Пароль успешно изменён. Войдите с новым паролем.
          </p>
        )}
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
