import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { URL } from "node:url";
const db = new PGlite();
const alice = "11111111-1111-4111-8111-111111111111";
const bob = "22222222-2222-4222-8222-222222222222";
const tables = [
  "profiles",
  "prayer_logs",
  "quran_bookmarks",
  "reading_progress",
  "habits",
  "tasks",
  "dhikr_sessions",
  "focus_sessions",
];
async function asUser(user: string) {
  await db.exec(
    `reset role; set role authenticated; select set_config('request.jwt.claim.sub', '${user}', false);`,
  );
}
beforeAll(async () => {
  // Model Supabase-provided auth/storage primitives; execute the actual migration unchanged.
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth; create schema storage;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth, storage to authenticated, anon;
    grant execute on function auth.uid() to authenticated, anon;
    create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    grant select, insert, update, delete on storage.objects to authenticated;
    create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1)-1] $$;
    insert into auth.users values ('${alice}'), ('${bob}');
  `);
  await db.exec(
    readFileSync(
      new URL(
        "../supabase/migrations/20261014021526_part1_private_worship.sql",
        import.meta.url,
      ),
      "utf8",
    ),
  );
  await asUser(alice);
  await db.exec(`
    insert into public.profiles (id, name) values ('${alice}', 'Alice');
    insert into public.prayer_logs (user_id, prayer, date, status) values ('${alice}', 'fajr', '2026-10-13', 'prayed');
    insert into public.quran_bookmarks (user_id, surah, ayah) values ('${alice}', 1, 1);
    insert into public.reading_progress (user_id, surah, ayah) values ('${alice}', 1, 1);
    insert into public.habits (user_id, title) values ('${alice}', 'Read');
    insert into public.tasks (user_id, title) values ('${alice}', 'Study');
    insert into public.dhikr_sessions (user_id, phrase, date) values ('${alice}', 'subhan', '2026-10-13');
    insert into public.focus_sessions (user_id, prayer, started_at, ended_at, duration_seconds, confirmation) values ('${alice}', 'fajr', '2026-10-13T10:00:00Z', '2026-10-13T10:05:00Z', 300, 'manual');
    insert into storage.objects (bucket_id, name) values ('user-assets', '${alice}/mat.png');
  `);
});
afterAll(async () => {
  await db.close();
});
describe("actual migration / Postgres row policies", () => {
  it("enables RLS and four policies on every user table", async () => {
    await db.exec("reset role");
    const result = await db.query<{ tablename: string; rowsecurity: boolean }>(
      "select tablename, rowsecurity from pg_tables where schemaname = 'public'",
    );
    for (const table of tables)
      expect(result.rows.find((r) => r.tablename === table)?.rowsecurity).toBe(
        true,
      );
    const policies = await db.query<{ count: number }>(
      "select count(*)::integer as count from pg_policies where schemaname = 'public'",
    );
    expect(policies.rows[0]?.count).toBe(32);
  });
  it("allows an owner to read all eight tables", async () => {
    await asUser(alice);
    for (const table of tables)
      expect(
        (await db.query(`select * from public.${table}`)).rows.length,
      ).toBe(1);
  });
  it("hides every private table from another account", async () => {
    await asUser(bob);
    for (const table of tables)
      expect((await db.query(`select * from public.${table}`)).rows).toEqual(
        [],
      );
  });
  it("rejects forged insert ownership", async () => {
    await asUser(bob);
    await expect(
      db.exec(
        `insert into public.tasks (user_id, title) values ('${alice}', 'Forged')`,
      ),
    ).rejects.toThrow(/row-level security/);
  });
  it("prevents moving an existing record to another user", async () => {
    await asUser(alice);
    await expect(
      db.exec(`update public.tasks set user_id = '${bob}'`),
    ).rejects.toThrow(/row-level security/);
  });
  it("does not allow cross-account updates or deletes", async () => {
    await asUser(bob);
    expect(
      (await db.query(`update public.tasks set title = 'stolen' returning id`))
        .rows,
    ).toHaveLength(0);
    expect(
      (await db.query(`delete from public.tasks returning id`)).rows,
    ).toHaveLength(0);
    await asUser(alice);
    expect(
      (await db.query<{ title: string }>("select title from public.tasks"))
        .rows[0]?.title,
    ).toBe("Study");
  });
  it("grants no anonymous access", async () => {
    await db.exec("reset role; set role anon");
    for (const table of tables)
      await expect(db.query(`select * from public.${table}`)).rejects.toThrow(
        /permission denied/,
      );
  });
  it("enforces duplicate logs, bookmark ranges, and focus duration constraints", async () => {
    await asUser(alice);
    await expect(
      db.exec(
        `insert into public.prayer_logs (user_id, prayer, date, status) values ('${alice}', 'fajr', '2026-10-13', 'late')`,
      ),
    ).rejects.toThrow(/unique constraint/);
    await expect(
      db.exec(
        `insert into public.quran_bookmarks (user_id, surah, ayah) values ('${alice}', 115, 1)`,
      ),
    ).rejects.toThrow(/check constraint/);
    await expect(
      db.exec(
        `insert into public.focus_sessions (user_id, prayer, started_at, ended_at, duration_seconds, confirmation) values ('${alice}', 'fajr', now(), now(), 300, 'manual')`,
      ),
    ).rejects.toThrow(/check constraint/);
  });
  it("keeps Storage private and rejects cross-folder reads/writes/renames", async () => {
    await db.exec("reset role");
    expect(
      (
        await db.query<{ public: boolean }>(
          "select public from storage.buckets",
        )
      ).rows[0]?.public,
    ).toBe(false);
    await asUser(bob);
    expect((await db.query("select * from storage.objects")).rows).toHaveLength(
      0,
    );
    await expect(
      db.exec(
        `insert into storage.objects (bucket_id, name) values ('user-assets', '${alice}/other.png')`,
      ),
    ).rejects.toThrow(/row-level security/);
    await asUser(alice);
    expect((await db.query("select * from storage.objects")).rows).toHaveLength(
      1,
    );
    await expect(
      db.exec(`update storage.objects set name = '${bob}/mat.png'`),
    ).rejects.toThrow(/row-level security/);
    await db.exec(`update storage.objects set name = '${alice}/renamed.png'`);
  });
});
