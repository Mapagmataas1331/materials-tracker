import Link from "next/link";
import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";

export function MissingRefsNotice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-dashed p-6 text-center">
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Button
        variant="outline"
        className="w-full sm:w-auto"
        render={<Link href="/settings" />}
        nativeButton={false}
      >
        <Settings />
        Открыть справочники
      </Button>
    </div>
  );
}
