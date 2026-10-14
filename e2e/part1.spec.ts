import { expect, test, type Page } from "@playwright/test";
async function onboard(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Your name", exact: true })
    .fill("Amina");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Continue (location is optional)",
      exact: true,
    })
    .click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByRole("button", { name: "Begin my day", exact: true }).click();
  await expect(page.getByText("Assalamu alaikum, Amina.")).toBeVisible();
}
test("onboarding, habits/tasks, prayer override, focus, refusal, persistence and RTL", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await onboard(page);
  await page
    .getByRole("button", { name: "My habits & tasks", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "A daily habit", exact: true })
    .fill("Read ten minutes");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page
    .getByRole("button", { name: "Complete today", exact: true })
    .click();
  await expect(page.getByText("1 day streak")).toBeVisible();
  await page.getByRole("button", { name: "Tasks", exact: true }).click();
  await page
    .getByRole("textbox", { name: "A task for today", exact: true })
    .fill("Prepare a study plan");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await page.getByRole("button", { name: "Complete", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Done ✓ · Undo", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page
    .getByRole("button", { name: "Confirm delete", exact: true })
    .click();
  await expect(page.getByText("A fresh start")).toBeVisible();
  await page
    .getByRole("button", { name: "Prayer & location settings", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Latitude", exact: true })
    .fill("41.8781");
  await page
    .getByRole("textbox", { name: "Longitude", exact: true })
    .fill("-87.6298");
  await page
    .getByRole("button", { name: "Use coordinates", exact: true })
    .click();
  await expect(page.getByText("Qibla direction")).toBeVisible();
  await page.getByRole("textbox", { name: "Fajr", exact: true }).fill("05:45");
  await page
    .getByRole("button", { name: "Save mosque times", exact: true })
    .click();
  await expect(page.getByText(/05:45.*Mosque/)).toBeVisible();
  await page
    .getByRole("button", { name: "Prayed", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "✓ Prayed", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Focus", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "I’m ready — begin", exact: true })
    .click();
  await page.waitForTimeout(1100);
  await page
    .getByRole("button", { name: "Finish & reflect", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Optional private reflection", exact: true })
    .fill("A calmer moment");
  await page
    .getByRole("button", { name: "Save session & mark prayed", exact: true })
    .click();
  await page.goto("/assistant");
  await page
    .getByRole("textbox", { name: "Your question", exact: true })
    .fill("Is my marriage valid?");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await expect(
    page.getByText("This requires guidance from a qualified scholar.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText("SOURCE PANEL", { exact: true })).toBeVisible();
  await page.goto("/me");
  await expect(page.getByText("1 sessions")).toBeVisible();
  await page.getByRole("button", { name: "Habits", exact: true }).click();
  await expect(
    page.getByText("Read ten minutes", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("Read ten minutes", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "العربية", exact: true }).click();
  await expect(page.getByText("انمُ بوتيرتك الخاصة.")).toBeVisible();
  const direction = await page
    .getByText("انمُ بوتيرتك الخاصة.")
    .evaluate((el) => getComputedStyle(el).direction);
  expect(direction).toBe("rtl");
  const todayTab = await page
    .getByRole("tab", { name: "اليوم", exact: true })
    .boundingBox();
  const meTab = await page
    .getByRole("tab", { name: "أنا", exact: true })
    .boundingBox();
  expect(todayTab!.x).toBeGreaterThan(meTab!.x);
  await page.getByRole("tab", { name: "اليوم", exact: true }).click();
  await expect(
    page.getByText("السلام عليكم، Amina.", { exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "/tmp/nurah-mobile-arabic.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("Qur’an alignment, bookmarks, last read, and cached offline fallback", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const ayah = { number: 1, numberInSurah: 1 };
  await page.route("https://api.alquran.cloud/v1/**", async (route) => {
    if (route.request().url().endsWith("/surah"))
      return route.fulfill({
        json: {
          code: 200,
          data: [
            {
              number: 1,
              name: "الفاتحة",
              englishName: "Al-Faatiha",
              englishNameTranslation: "The Opening",
              numberOfAyahs: 7,
              revelationType: "Meccan",
            },
          ],
        },
      });
    return route.fulfill({
      json: {
        code: 200,
        data: [
          {
            edition: { identifier: "quran-uthmani" },
            ayahs: [
              { ...ayah, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" },
            ],
          },
          {
            edition: { identifier: "en.sahih" },
            ayahs: [
              {
                ...ayah,
                text: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
              },
            ],
          },
          {
            edition: { identifier: "ar.alafasy" },
            ayahs: [
              {
                ...ayah,
                text: "",
                audio:
                  "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3",
              },
            ],
          },
        ],
      },
    });
  });
  await onboard(page);
  await page.getByRole("button", { name: "Open Qur’an", exact: true }).click();
  await page
    .getByRole("button", { name: "1. Al-Faatiha", exact: true })
    .click();
  await expect(
    page.getByText(
      "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Bookmark", exact: true }).click();
  await page.getByRole("button", { name: "Mark read", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Bookmarked ✓", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Last read ✓", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "← Surah index", exact: true })
    .click();
  await page.unroute("https://api.alquran.cloud/v1/**");
  await page.route("https://api.alquran.cloud/v1/**", (route) => route.abort());
  await page
    .getByRole("button", { name: "Continue reading · 1:1", exact: true })
    .click();
  await expect(
    page.getByText("Offline copy · previously cached text", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Last read ✓", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("dhikr persistence, separate adhkar periods, location denial and Quran provider error", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "permissions", {
      value: { query: async () => ({ state: "denied" }) },
    });
  });
  await onboard(page);
  await page.getByRole("tab", { name: "Learn", exact: true }).click();
  await page
    .getByRole("button", { name: "Count dhikr, current count 0", exact: true })
    .click();
  await page.getByRole("button", { name: /^○ سورة الإخلاص/ }).click();
  await expect(
    page.getByRole("button", { name: /^✓ سورة الإخلاص/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Evening", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /^○ سورة الإخلاص/ }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Count dhikr, current count 1",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^✓ سورة الإخلاص/ }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Prayer", exact: true }).click();
  await page
    .getByRole("button", { name: "Use my location", exact: true })
    .click();
  await expect(
    page.getByText(
      "Location permission denied. Enable it in settings or enter coordinates below.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.route("https://api.alquran.cloud/v1/**", (route) => route.abort());
  await page.getByRole("tab", { name: "Qur’an", exact: true }).click();
  await expect(
    page.getByText(
      "Qur’an provider could not be reached. Check your connection or read a previously cached surah.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Try again", exact: true }),
  ).toBeVisible();
});
