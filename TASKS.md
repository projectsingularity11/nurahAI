# Part 1 implementation status

- [x] Expo SDK 57 / Expo Router / TypeScript / NativeWind scaffold and Vercel SPA export configuration.
- [x] Reusable dark UI, English/Arabic interface and RTL layouts.
- [x] Typed Zustand state, guest persistence, Supabase auth/client, isolated caches and sync queue.
- [x] Eight-table migration, ownership RLS, private Storage bucket, indexes and constraints.
- [x] Onboarding, prayer methods/calculations, countdown, bearing, overrides and prayer logs.
- [x] Salah Focus with native QR/manual confirmation, timer, reflection and saved records.
- [x] Qur’an index, Arabic/English reader, per-verse Expo Audio playback, bookmarks, last-read and cached-text fallback.
- [x] Labeled sourced hadith seed, dhikr counter and morning/evening starter checklist.
- [x] Habit/task CRUD and daily streaks.
- [x] Placeholder assistant interface, citation panels and personal-ruling refusal boundary.
- [x] Unit, state, Postgres policy and browser integration test suites.

Next acceptance work (not certified by this implementation):

- [ ] Configure a Supabase project and smoke-test email confirmation, two accounts, cloud sync and Storage on devices.
- [ ] Physical iOS/Android validation: Expo Go SDK compatibility, location denied/granted, QR scan, audio and RTL.
- [ ] Content-provider licensing/review and Arabic accessibility review before release.
- [ ] Live Qur’an/audio network validation outside the restricted build environment.
- [ ] Server-side approved-source retrieval and robust policy evaluations before replacing the placeholder assistant.

Explicit limitations: notification preference only, NFC fallback only, computed bearing only, no multi-device conflict resolver. All features excluded in MVP_SCOPE.md remain excluded.

SDK 57 upgrade:

- [x] Expo 57.0.28, React 19.2.3 and React Native 0.86.3 with SDK-aligned native modules.
- [x] Expo AV replaced with Expo Audio, including cancellation, errors, timeout and resource cleanup.
- [x] Router tab types and React reader-state/lint compatibility updated.
- [x] Reproducible lockfile and phone testing instructions.
- [x] SDK 57 typecheck, lint, unit/database/audio tests, web export, native exports and browser flows verified.
- [x] Expo install dependency alignment verified using the SDK 57 bundled map.
- [ ] Complete Expo Doctor online schema/directory lookups on a machine with access to those services (19/21 checks pass in the restricted environment).
