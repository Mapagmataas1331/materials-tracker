const numberFormatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 3 });
const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "short",
  timeStyle: "short",
});

export function formatQuantity(value: number): string {
  return numberFormatter.format(value);
}

export function formatDateTime(value: Date | string): string {
  return dateTimeFormatter.format(new Date(value));
}

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  receipt: "Поступление",
  issue: "Списание",
  adjustment: "Корректировка",
};
