import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as Crypto from 'expo-crypto';
import type { PendingMutation, Profile, Records, TableName, TableRow } from '../lib/models';
import { storage } from '../lib/storage';
export const id = () => Crypto.randomUUID();
export const emptyRecords = (): Records => ({ prayer_logs: [], quran_bookmarks: [], reading_progress: [], habits: [], tasks: [], dhikr_sessions: [], focus_sessions: [] });
export const defaultProfile = (owner = 'guest'): Profile => ({ id: owner, name: '', calculation_method: 'ISNA', notifications: false, locale: 'en', mosque_overrides: {}, onboarded: false });
interface Scope { profile: Profile; records: Records; pending: PendingMutation[]; profileRevision: number; profileDirty: boolean }
const freshScope = (owner: string): Scope => ({ profile: defaultProfile(owner), records: emptyRecords(), pending: [], profileRevision: 0, profileDirty: false });
interface AppState extends Scope {
  owner: string; scopes: Record<string, Scope>; hydrated: boolean; online: boolean; syncError: string | null; syncing: boolean;
  setHydrated: () => void; setOnline: (value: boolean) => void; switchOwner: (owner: string) => void;
  updateProfile: (patch: Partial<Omit<Profile, 'id'>>) => void;
  put: <T extends TableName>(table: T, row: TableRow<T>) => void;
  remove: (table: TableName, rowId: string) => void;
}
export const useApp = create<AppState>()(persist((set, get) => ({
  ...freshScope('guest'), owner: 'guest', scopes: {}, hydrated: false, online: true, syncError: null, syncing: false,
  setHydrated: () => set({ hydrated: true }), setOnline: (online) => set({ online }),
  switchOwner: (owner) => {
    const current = get();
    if (current.owner === owner) return;
    const { profile, records, pending, profileRevision, profileDirty } = current;
    const scopes = { ...current.scopes, [current.owner]: { profile, records, pending, profileRevision, profileDirty } };
    set({ ...scopes[owner] ?? freshScope(owner), owner, scopes, syncError: null, syncing: false });
  },
  updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch }, profileDirty: true, profileRevision: s.profileRevision + 1 })),
  put: (table, row) => set((s) => {
    if (row.user_id !== s.owner) return {};
    const rows = s.records[table].filter((r) => r.id !== row.id);
    return { records: { ...s.records, [table]: [...rows, row] }, pending: s.owner === 'guest' ? [] : [...s.pending.filter((m) => m.table !== table || m.row.id !== row.id), { id: id(), table, row, operation: 'upsert' }] };
  }),
  remove: (table, rowId) => set((s) => {
    const row = s.records[table].find((r) => r.id === rowId);
    if (!row) return {};
    return { records: { ...s.records, [table]: s.records[table].filter((r) => r.id !== rowId) }, pending: s.owner === 'guest' ? [] : [...s.pending.filter((m) => m.table !== table || m.row.id !== row.id), { id: id(), table, row, operation: 'delete' }] };
  }),
}), {
  name: 'nurah-part1-v1', storage: createJSONStorage(() => storage),
  partialize: ({ profile, records, pending, owner, scopes, profileRevision, profileDirty }) => ({ profile, records, pending, owner, scopes, profileRevision, profileDirty }),
  onRehydrateStorage: () => (_, error) => {
    useApp.setState({ hydrated: true, ...(error ? { syncError: 'Local storage could not be loaded. Changes may not persist.' } : {}) });
  },
}));
export function owned() { const user_id = useApp.getState().owner; return { id: id(), user_id, created_at: new Date().toISOString() }; }
