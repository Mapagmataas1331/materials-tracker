import { describe, expect, it } from "vitest";

import { safeCallbackUrl } from "./safe-callback-url";

describe("safeCallbackUrl", () => {
  it("allows same-origin relative paths", () => {
    expect(safeCallbackUrl("/materials")).toBe("/materials");
    expect(safeCallbackUrl("/materials/abc")).toBe("/materials/abc");
  });

  it("rejects open redirects", () => {
    expect(safeCallbackUrl("//evil.example")).toBe("/materials");
    expect(safeCallbackUrl("/\\evil")).toBe("/materials");
    expect(safeCallbackUrl("https://evil.example")).toBe("/materials");
  });

  it("falls back when missing", () => {
    expect(safeCallbackUrl(undefined)).toBe("/materials");
    expect(safeCallbackUrl(null, "/issues")).toBe("/issues");
  });
});
