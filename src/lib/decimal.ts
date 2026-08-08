/**
 * Format a finite number as a decimal string for Postgres `numeric`,
 * avoiding binary float drift in SQL arithmetic.
 */
export function toDecimalString(value: number, scale = 3): string {
  if (!Number.isFinite(value)) {
    throw new Error("Ожидалось конечное число");
  }
  return value.toFixed(scale);
}

/** Sign shown in material history for a ledger row. */
export function movementQuantitySign(
  type: string,
  quantity: number,
): "+" | "-" {
  if (type === "issue") return "-";
  if (type === "adjustment") return quantity < 0 ? "-" : "+";
  return "+";
}

export function absoluteQuantity(quantity: number): number {
  return Math.abs(quantity);
}
