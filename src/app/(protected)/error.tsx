"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ProtectedError({ error }: { error: Error & { digest?: string } }) {
  if (process.env.NODE_ENV !== "production") {
    console.error(error);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 py-20 text-center">
      <ShieldAlert className="size-10 text-muted-foreground" />
      <h1 className="text-lg font-semibold">Что-то пошло не так</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Попробуйте обновить страницу. Если ошибка повторяется, обратитесь к администратору.
      </p>
      <Button render={<Link href="/materials" />} nativeButton={false}>
        На главную
      </Button>
    </div>
  );
}
