# Nurah AI

Nurah is a Muslim-focused daily companion for prayer, Qur’an, remembrance, learning, and small meaningful habits. It is a study and organization tool and **does not issue fatwas**.

This repository implements **Part 1 only** with Expo SDK 57, Expo Router, strict TypeScript, NativeWind/Tailwind, Zustand, and Supabase. The interface uses a charcoal/deep-green palette, subtle gold, high-contrast text, and switchable English/Arabic with RTL layout. The excluded features in [MVP_SCOPE.md](MVP_SCOPE.md) remain excluded.

## Run locally

Use Node 22 LTS (22.13.0 or newer) or a supported Node 24 LTS release, and npm. From the repository root:

```bash
npm ci
cp .env.example .env
npm start
```

Press `w` for web, `a` for Android, or scan the Metro QR with a compatible Expo Go client. Alternatively:

```bash
npm run web
npm run android
npm run ios
```

`ios` requires macOS and an iOS simulator. The native dependencies target **SDK 57** (Expo package **57.0.28**, React **19.2.3**, React Native **0.86.3**). Use your SDK-57-compatible Expo Go app. Qur’an playback uses **Expo Audio** because Expo AV is no longer supported by the current SDK.

No environment values are required for **local guest mode**. Guest progress persists on this device and is separate from account progress. Configure Supabase to enable email/password accounts and private cloud sync.

## Test on your phone with Expo Go SDK 57

Run these commands on your own computer in the repository checkout:

```bash
git fetch origin
git switch upgrade/expo-sdk-57
git pull --ff-only
npm ci
npx expo start --go --clear --lan
```

Keep the computer and phone on the same Wi-Fi network. Open Expo Go and scan the Metro QR (Android), or use the Camera app to open the QR in Expo Go (iPhone). Allow local-network access on iOS if prompted. Keep Metro running. Guest mode needs no credentials. For accounts, keep your existing `.env`, or copy `.env.example` only if `.env` does not exist, fill the two public Supabase values, and restart Metro.

If LAN access is blocked by the network, use:

```bash
npx expo start --go --clear --tunnel
```

Expo CLI may offer to install its optional tunnel helper. For local Supabase on a physical phone, use your computer's LAN IP in the Supabase URL rather than `localhost`, or use a hosted Supabase project.

Check these flows on the phone:

1. Complete guest onboarding; allow GPS or use manual coordinates. Check all prayer calculation methods, countdown, Qibla bearing, mosque overrides, and prayer logs.
2. Start Salah Focus manually, finish, add a reflection, and confirm the session is saved. Optionally scan a QR containing `nurah://prayer-mat`.
3. Open a surah, play/stop a verse, switch tabs to confirm playback stops, bookmark an ayah, and mark it read. Reopen the app to check guest progress remains.
4. Use dhikr and both adhkar checklists; add/complete/delete tasks and complete a daily habit.
5. Switch to Arabic to check RTL. Ask the assistant a planning question and a personal-ruling question to verify source panels and refusal.
6. If Supabase is configured, sign in and verify cloud synchronization and account/guest separation.

A bundle export checks native code compilation, but physical GPS/camera/audio and Supabase account behavior still require this device acceptance pass.

## Environment

| Variable                               | Value                               |
| -------------------------------------- | ----------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`             | Supabase project URL                |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase **publishable** client key |

These values are embedded in browser/mobile bundles. **Never use a secret or service-role key.** Copy `.env.example`, fill both values, then restart Metro or rebuild web. No AI key, Qur’an API key, or location API key is needed.

## Supabase setup

Install the Supabase CLI and Docker for a local Supabase stack:

```bash
supabase start
supabase db reset
supabase status
```

Use the reported local API URL and public client key in `.env`. For physical devices, use a reachable LAN URL instead of `localhost`. The migration creates eight private tables, per-user RLS policies, indexes, constraints, and a private `user-assets` Storage bucket. The bucket accepts JPEG/PNG up to 5 MiB and restricts objects to `<user UUID>/<filename>`. The storage service is implemented without an upload screen.

For your own hosted project, review the migration first, then link and apply it:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

No hosted project is created or modified by this repository. Configure the Auth Site URL for your web origin (`http://localhost:8081` locally, your HTTPS Vercel domain in production). Confirm email when required, then return to the app and sign in with your password. Automatic email-link sign-in and password-reset flows are not included. Hosted auth and storage must be smoke-tested with your project's configuration.

## Validation and web deployment

```bash
npx expo install --fix
npx expo-doctor
npm run typecheck
npm run lint
npm test
npm run build:web
# Or run all four:
npm run check
```

Web uses `expo export -p web` and writes **dist/**. [vercel.json](vercel.json) sets the build/output and a SPA fallback for direct routes. To deploy, import this repository into Vercel, set both public environment variables, and use the checked-in configuration. No production deployment is performed as part of this implementation.

Preview the actual export:

```bash
npm run build:web
npm run preview:web
# Open http://127.0.0.1:4173
```

Browser integration tests use Chromium:

```bash
npx playwright install chromium
npm run build:web
npm run test:e2e
```

The test config uses `/usr/bin/chromium` if installed, or Playwright's downloaded browser. Optionally set `PLAYWRIGHT_CHROMIUM_PATH` to a local Chromium executable. This is a test-only variable, not an app secret.

## Built

- Five-step onboarding: welcome, name, optional location, calculation method, and notification preference.
- Home and Today/Prayer/Qur’an/Learn/Me tabs, plus full-screen Salah Focus and assistant routes.
- Shared Screen, Card, Button, TextInput, SectionHeader, ProgressRing, EmptyState, ErrorState, and LoadingState.
- Prayer calculations on-device with `adhan`: ISNA, MWL, Umm al-Qura, Egyptian, Karachi, Dubai; countdown, true-north Qibla bearing, GPS/manual coordinates, mosque-time overrides, and prayed/late/missed logs.
- Salah Focus: optional QR mat scan (`nurah://prayer-mat` or `nurah://prayer-mat/<id>`), manual fallback, elapsed timer, optional reflection, focus-session save, and prayer-log update.
- Qur’an index and reader: Uthmani Arabic, Saheeh International English, Mishary Alafasy per-verse audio via Expo Audio, bookmarks, explicit last-read tracking, ayah navigation, and cached text fallback.
- Clearly labeled daily hadith seed excerpt with Arabic/English, collection, number, narrator, grade, and source link.
- Persistent tasbih counter, sourced morning/evening starter checklist, daily habits/streaks, and task add/complete/delete.
- Supabase email/password auth, account-isolated local caches, durable latest-mutation queue with delete tombstones, retryable sync, private Storage helpers, and all data-model types.
- Placeholder assistant behind an interface, source panels, conservative English/Arabic personal-ruling refusals, and abstention when approved religious evidence is unavailable.

## Mocked and limited

- **Hadith:** one fixed, sourced seed excerpt with a paraphrased English meaning; no rotating live feed.
- **AI:** no model, live retrieval, tafsir, or scholarly-opinion generation. Only a fixed sourced excerpt and generic organization suggestions. The local keyword gate is conservative and is not sufficient security for a future LLM service.
- **Notifications:** preference only; no scheduling or OS permission request.
- **NFC:** unavailable in Expo Go/web; QR on native and manual fallback are implemented. NFC requires a custom native build and additional hardware testing.
- **Qibla:** computed true-north bearing, not a sensor-driven compass. Manual times use the device time zone; use nearby coordinates. Asr uses the standard shadow factor. Umm al-Qura uses a fixed 90-minute Isha interval; verify Ramadan times with your mosque. Consult your mosque where high-latitude conditions prevent calculation.
- **Qur’an:** needs Internet for first fetch and streaming audio; previously loaded text is cached. No bundled full Qur’an or downloaded audio, automatic continuous recitation, or tafsir. Content-provider availability/licensing and live audio need release review.
- **Offline:** local progress persists and account writes queue, but there is no installable offline web shell/service worker. QR/location need real-device permission tests. Focus sessions are saved on completion, not recovered after process termination; they do not block other apps.
- **Sync:** a single-device latest-write flow, not conflict resolution for simultaneous edits on several devices. Guest data is not automatically imported into accounts. Local account caches are not encrypted; shared-device users should clear app/site data.
- **Verification:** automated tests exercise guest user flows, prayer math, dates/streaks, guardrails, account isolation, and actual Postgres RLS/Storage policies with Supabase auth/storage primitives modeled in PGlite. Browser Qur’an tests use HTTP fixtures. No live Supabase account, physical QR scan, GPS sensor, NFC, or live audio has been certified.

## SDK 57 validation

The upgrade uses Expo **57.0.28**, React **19.2.3**, React Native **0.86.3**, and the SDK 57 versions selected by Expo tooling. A clean `npm ci`, typecheck, lint, unit/database/audio tests, web export, and native bundle exports are verified. The browser suite also exercises actual fixture audio decoding, navigation cleanup, end-of-track handling, and failed loads.

In the managed build environment, the online `npx expo install --fix` lookup is blocked by network policy. Running `EXPO_OFFLINE=1 npx expo install --fix` uses the installed SDK's bundled version map and reports all dependencies up to date. Expo Doctor reports **19/21 checks passing**: the app-schema lookup and React Native Directory metadata check cannot reach their external services. The missing Expo Asset peer dependency was fixed; no local compatibility findings remain. These online checks are **not claimed as passing**. Run `npx expo-doctor` locally with normal Internet access to complete them before release.

## Recommended next task

Run a device and configured-Supabase acceptance pass, then obtain approval for the Qur’an/hadith providers and curated content. Before connecting a real AI model, implement server-enforced policy checks and approved-source retrieval with citation validation and adversarial evaluations.
