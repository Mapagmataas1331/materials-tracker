"use client";

import { Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatQuantity } from "@/lib/format";
import type { MaterialListItem } from "@/server/services/materials";

function statusLabel(status: MaterialListItem["status"]) {
  if (status === "out") return "Нет в наличии";
  if (status === "low") return "Ниже минимума";
  return "В норме";
}

function toCsv(materials: MaterialListItem[]) {
  const header = ["Наименование", "Категория", "Остаток", "Мин. остаток", "Ед.", "Статус"];
  const rows = materials.map((m) => [
    m.name,
    m.categoryName,
    String(m.totalStock),
    String(m.minStock),
    m.unitShortName,
    statusLabel(m.status),
  ]);
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  return [header, ...rows].map((row) => row.map(escape).join(";")).join("\r\n");
}

export function PurchaseListActions({ materials }: { materials: MaterialListItem[] }) {
  function handleCsv() {
    const bom = "\uFEFF";
    const blob = new Blob([bom + toCsv(materials)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trebuetsya-zakupka-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="flex flex-col gap-2 print:hidden sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={materials.length === 0}
          onClick={() => window.print()}
        >
          <Printer />
          Печать
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={materials.length === 0}
          onClick={handleCsv}
        >
          <Download />
          CSV
        </Button>
      </div>

      <div className="hidden print:block">
        <h1 className="mb-1 text-lg font-semibold">Требуется закупка</h1>
        <p className="mb-4 text-sm text-muted-foreground">
          Сформировано: {new Date().toLocaleString("ru-RU")}
        </p>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border px-2 py-1 text-left">Наименование</th>
              <th className="border px-2 py-1 text-left">Категория</th>
              <th className="border px-2 py-1 text-right">Остаток</th>
              <th className="border px-2 py-1 text-right">Мин.</th>
              <th className="border px-2 py-1 text-left">Статус</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id}>
                <td className="border px-2 py-1">{m.name}</td>
                <td className="border px-2 py-1">{m.categoryName}</td>
                <td className="border px-2 py-1 text-right">
                  {formatQuantity(m.totalStock)} {m.unitShortName}
                </td>
                <td className="border px-2 py-1 text-right">
                  {formatQuantity(m.minStock)} {m.unitShortName}
                </td>
                <td className="border px-2 py-1">{statusLabel(m.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
