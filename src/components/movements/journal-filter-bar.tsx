"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Option {
  id: string;
  name: string;
}

export function JournalFilterBar({
  users,
  storageLocations,
}: {
  users: Option[];
  storageLocations: Option[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [materialQuery, setMaterialQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setMaterialQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const pushParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      params.delete("page");
      startTransition(() => {
        const qs = params.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
      });
    },
    [pathname, router, searchParams],
  );

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      pushParams((params) => {
        if (value && value !== "all") {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
    },
    [pushParams],
  );

  function handleMaterialSearch(value: string) {
    setMaterialQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParam("q", value.trim() || null);
    }, 300);
  }

  const typeItems = {
    all: "Все типы",
    receipt: "Поступление",
    issue: "Списание",
    adjustment: "Корректировка",
  };
  const userItems = {
    all: "Все пользователи",
    ...Object.fromEntries(users.map((u) => [u.id, u.name])),
  };
  const locationItems = {
    all: "Все места",
    ...Object.fromEntries(storageLocations.map((l) => [l.id, l.name])),
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:max-w-xs sm:flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Материал..."
            value={materialQuery}
            onChange={(e) => handleMaterialSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select
          items={typeItems}
          value={searchParams.get("type") ?? "all"}
          onValueChange={(value) => updateParam("type", value)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все типы</SelectItem>
            <SelectItem value="receipt">Поступление</SelectItem>
            <SelectItem value="issue">Списание</SelectItem>
            <SelectItem value="adjustment">Корректировка</SelectItem>
          </SelectContent>
        </Select>
        <Select
          items={locationItems}
          value={searchParams.get("location") ?? "all"}
          onValueChange={(value) => updateParam("location", value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все места</SelectItem>
            {storageLocations.map((l) => (
              <SelectItem key={l.id} value={l.id}>
                {l.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          items={userItems}
          value={searchParams.get("user") ?? "all"}
          onValueChange={(value) => updateParam("user", value)}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все пользователи</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="date"
          aria-label="Дата с"
          value={searchParams.get("from") ?? ""}
          onChange={(e) => updateParam("from", e.target.value || null)}
          className="w-full sm:w-44"
        />
        <span className="hidden text-sm text-muted-foreground sm:inline">—</span>
        <Input
          type="date"
          aria-label="Дата по"
          value={searchParams.get("to") ?? ""}
          onChange={(e) => updateParam("to", e.target.value || null)}
          className="w-full sm:w-44"
        />
      </div>
    </div>
  );
}
