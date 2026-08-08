import { describe, expect, it } from "vitest";

import { absoluteQuantity, movementQuantitySign, toDecimalString } from "./decimal";

describe("toDecimalString", () => {
  it("formats finite numbers at given scale", () => {
    expect(toDecimalString(1.2, 3)).toBe("1.200");
    expect(toDecimalString(0.1 + 0.2, 3)).toBe("0.300");
  });

  it("rejects non-finite values", () => {
    expect(() => toDecimalString(Number.NaN)).toThrow();
    expect(() => toDecimalString(Number.POSITIVE_INFINITY)).toThrow();
  });
});

describe("movementQuantitySign", () => {
  it("signs receipt and issue", () => {
    expect(movementQuantitySign("receipt", 5)).toBe("+");
    expect(movementQuantitySign("issue", 5)).toBe("-");
  });

  it("signs adjustments by quantity sign", () => {
    expect(movementQuantitySign("adjustment", 3)).toBe("+");
    expect(movementQuantitySign("adjustment", -3)).toBe("-");
  });
});

describe("absoluteQuantity", () => {
  it("returns absolute value", () => {
    expect(absoluteQuantity(-4.5)).toBe(4.5);
  });
});
