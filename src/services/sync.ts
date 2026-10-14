import { supabase } from "../lib/supabase";
import { useApp } from "../store/app";
import type { Records, TableName } from "../lib/models";
// Sequential writes preserve ordering, including offline edits followed by deletes.
export async function syncAccount(): Promise<void> {
  const initial = useApp.getState();
  if (
    !supabase ||
    initial.owner === "guest" ||
    !initial.online ||
    initial.syncing
  )
    return;
  const owner = initial.owner;
  const stillActive = () => useApp.getState().owner === owner;
  useApp.setState({ syncing: true, syncError: null });
  try {
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (auth.user?.id !== owner || !stillActive()) return;
    const snapshot = useApp.getState();
    if (snapshot.profileDirty) {
      const { error } = await supabase
        .from("profiles")
        .upsert(snapshot.profile);
      if (error) throw error;
      if (!stillActive()) return;
      if (useApp.getState().profileRevision === snapshot.profileRevision)
        useApp.setState({ profileDirty: false });
    }
    for (const mutation of snapshot.pending) {
      if (!stillActive()) return;
      const result =
        mutation.operation === "delete"
          ? await supabase
              .from(mutation.table)
              .delete()
              .eq("id", mutation.row.id)
              .eq("user_id", owner)
          : await supabase.from(mutation.table).upsert(mutation.row);
      if (result.error) throw result.error;
      if (!stillActive()) return;
      useApp.setState((s) => ({
        pending: s.pending.filter((m) => m.id !== mutation.id),
      }));
    }
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", owner)
      .maybeSingle();
    if (profileError) throw profileError;
    if (!stillActive()) return;
    if (profile && !useApp.getState().profileDirty)
      useApp.setState({ profile });
    const tables = Object.keys(snapshot.records) as TableName[];
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", owner);
      if (error) throw error;
      if (!stillActive()) return;
      useApp.setState((s) => {
        const rows = new Map<string, Records[TableName][number]>(
          (data ?? []).map((r) => [r.id, r]),
        );
        for (const m of s.pending.filter((m) => m.table === table)) {
          if (m.operation === "delete") rows.delete(m.row.id);
          else rows.set(m.row.id, m.row);
        }
        return { records: { ...s.records, [table]: [...rows.values()] } };
      });
    }
  } catch (error) {
    if (stillActive())
      useApp.setState({
        syncError:
          error instanceof Error
            ? error.message
            : "Sync failed. Your changes remain on this device; retry when connected.",
      });
  } finally {
    if (stillActive()) useApp.setState({ syncing: false });
  }
}
