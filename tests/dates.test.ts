import { describe, expect, it } from "vitest";
import { dailyStreak, localDate, timerText } from "../src/lib/dates";
describe("local dates and daily streaks", () => {
  it("uses local calendar components", () => {
    expect(localDate(new Date(2026, 9, 13, 0, 1))).toBe("2026-10-13");
  });
  it("counts through yesterday before today is completed", () => {
    expect(
      dailyStreak(["2026-10-11", "2026-10-12"], new Date(2026, 9, 13)),
    ).toBe(2);
  });
  it("deduplicates completion and stops at gaps", () => {
    expect(
      dailyStreak(
        ["2026-10-13", "2026-10-13", "2026-10-12", "2026-10-10"],
        new Date(2026, 9, 13),
      ),
    ).toBe(2);
  });
  it("handles month boundaries and an expired streak", () => {
    expect(
      dailyStreak(["2026-09-30", "2026-10-01"], new Date(2026, 9, 1)),
    ).toBe(2);
    expect(dailyStreak(["2026-10-10"], new Date(2026, 9, 13))).toBe(0);
  });
  it("clamps countdowns and supports hours", () => {
    expect(timerText(-1)).toBe("00:00:00");
    expect(timerText(3661)).toBe("01:01:01");
  });
});
