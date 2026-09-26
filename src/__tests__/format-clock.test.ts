import { describe, expect, it } from "vitest";
import { FIXED_BOOT_ISO, formatClock } from "@/lib/format-clock";

describe("formatClock", () => {
  it("slices UTC time from ISO strings deterministically", () => {
    expect(formatClock("2026-01-01T00:00:00.000Z")).toBe("00:00:00");
    expect(formatClock("2026-09-26T14:05:09.123Z")).toBe("14:05:09");
  });

  it("uses a fixed boot stamp", () => {
    expect(FIXED_BOOT_ISO).toBe("2026-01-01T00:00:00.000Z");
    expect(formatClock(FIXED_BOOT_ISO)).toBe("00:00:00");
  });

  it("falls back safely for invalid input", () => {
    expect(formatClock("not-a-date")).toBe("--:--:--");
  });
});
