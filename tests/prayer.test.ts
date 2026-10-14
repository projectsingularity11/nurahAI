import { describe, expect, it } from "vitest";
import { METHODS } from "../src/lib/models";
import {
  nextPrayer,
  prayerSchedule,
  qiblaBearing,
  validOverride,
} from "../src/services/prayer";
const chicago = { latitude: 41.8781, longitude: -87.6298 };
describe("prayer calculation", () => {
  for (const method of METHODS)
    it(`produces ordered finite times for ${method}`, () => {
      const schedule = prayerSchedule(
        chicago,
        method,
        new Date(2026, 9, 13, 12),
      );
      expect(schedule.map((p) => p.name)).toEqual([
        "fajr",
        "dhuhr",
        "asr",
        "maghrib",
        "isha",
      ]);
      schedule.forEach((p, i) => {
        expect(Number.isFinite(p.time.getTime())).toBe(true);
        if (i) expect(p.time > schedule[i - 1]!.time).toBe(true);
      });
    });
  it("rolls past Isha into tomorrow", () => {
    const now = new Date(2026, 9, 13, 23, 59);
    const next = nextPrayer(chicago, "ISNA", now);
    expect(next.name).toBe("fajr");
    expect(next.time > now).toBe(true);
    expect(next.time.getDate()).toBe(14);
  });
  it("honors local mosque override and next prayer order", () => {
    const date = new Date(2026, 9, 13, 12);
    const fajr = prayerSchedule(chicago, "ISNA", date, { fajr: "05:45" })[0]!;
    expect(fajr.time.getHours()).toBe(5);
    expect(fajr.time.getMinutes()).toBe(45);
    expect(fajr.overridden).toBe(true);
    expect(
      nextPrayer(chicago, "ISNA", new Date(2026, 9, 13, 5, 44), {
        fajr: "05:45",
      }).name,
    ).toBe("fajr");
  });
  it("validates coordinates and 24-hour overrides", () => {
    expect(() =>
      prayerSchedule({ latitude: 200, longitude: 0 }, "ISNA"),
    ).toThrow();
    expect(validOverride("23:59")).toBe(true);
    expect(validOverride("24:00")).toBe(false);
    expect(validOverride("6:00")).toBe(false);
  });
  it("has a sensible true-north Qibla bearing for Chicago", () => {
    expect(qiblaBearing(chicago)).toBeGreaterThan(45);
    expect(qiblaBearing(chicago)).toBeLessThan(55);
  });
});
