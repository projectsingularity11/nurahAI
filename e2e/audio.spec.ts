import { expect, test } from "@playwright/test";

// A local PCM fixture exercises decoding/playback without depending on the CDN.
function audioFixture() {
  const dataSize = 16000 * 3 * 2;
  const bytes = Buffer.alloc(44 + dataSize);
  bytes.write("RIFF", 0);
  bytes.writeUInt32LE(36 + dataSize, 4);
  bytes.write("WAVEfmt ", 8);
  bytes.writeUInt32LE(16, 16);
  bytes.writeUInt16LE(1, 20);
  bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(16000, 24);
  bytes.writeUInt32LE(32000, 28);
  bytes.writeUInt16LE(2, 32);
  bytes.writeUInt16LE(16, 34);
  bytes.write("data", 36);
  bytes.writeUInt32LE(dataSize, 40);
  return bytes;
}

test("SDK 57 Expo Audio plays, stops on tab navigation, finishes, and handles failed audio", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const tracked = window as typeof window & {
      testAudioPlayers: HTMLAudioElement[];
    };
    tracked.testAudioPlayers = [];
    window.Audio = new Proxy(window.Audio, {
      construct(target, args) {
        const audio = Reflect.construct(target, args) as HTMLAudioElement;
        tracked.testAudioPlayers.push(audio);
        return audio;
      },
    });
  });
  const audioUrl =
    "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3";
  await page.route(audioUrl, (route) =>
    route.fulfill({ contentType: "audio/wav", body: audioFixture() }),
  );
  await page.route("https://api.alquran.cloud/v1/**", (route) =>
    route.fulfill({
      json: {
        code: 200,
        data: [
          {
            edition: { identifier: "quran-uthmani" },
            ayahs: [
              {
                number: 1,
                numberInSurah: 1,
                text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
              },
            ],
          },
          {
            edition: { identifier: "en.sahih" },
            ayahs: [
              {
                number: 1,
                numberInSurah: 1,
                text: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
              },
            ],
          },
          {
            edition: { identifier: "ar.alafasy" },
            ayahs: [{ number: 1, numberInSurah: 1, text: "", audio: audioUrl }],
          },
        ],
      },
    }),
  );
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
  await page.goto("/quran?surah=1&ayah=1");
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Stop", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Learn", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(() =>
        (
          window as typeof window & { testAudioPlayers: HTMLAudioElement[] }
        ).testAudioPlayers.every((audio) => audio.paused),
      ),
    )
    .toBe(true);
  await page.getByRole("tab", { name: "Qur’an", exact: true }).click();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Stop", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Play", exact: true }),
  ).toBeVisible({ timeout: 8000 });
  await page.unroute(audioUrl);
  await page.route(audioUrl, (route) => route.abort());
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(
    page.getByText(
      "Audio playback failed. Check your connection and try again.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Play", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
