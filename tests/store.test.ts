import { beforeEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { defaultProfile, emptyRecords, owned, useApp } from "../src/store/app";
vi.mock("expo-crypto", () => ({ randomUUID: () => randomUUID() }));
vi.mock("../src/lib/storage", () => ({
  storage: {
    getItem: async () => null,
    setItem: async () => undefined,
    removeItem: async () => undefined,
  },
}));
beforeEach(() =>
  useApp.setState({
    owner: "guest",
    profile: defaultProfile(),
    records: emptyRecords(),
    scopes: {},
    pending: [],
    profileDirty: false,
    profileRevision: 0,
  }),
);
describe("account isolation and durable mutation queue", () => {
  it("keeps guest progress separate from accounts and restores it on sign-out", () => {
    const guestTask = {
      ...owned(),
      title: "Guest task",
      completed: false,
      completed_at: null,
    };
    useApp.getState().put("tasks", guestTask);
    useApp.getState().updateProfile({ name: "Guest" });
    useApp.getState().switchOwner("alice");
    expect(useApp.getState().records.tasks).toHaveLength(0);
    expect(useApp.getState().profile.name).toBe("");
    useApp.getState().put("tasks", {
      ...owned(),
      title: "Private",
      completed: false,
      completed_at: null,
    });
    useApp.getState().switchOwner("guest");
    expect(useApp.getState().records.tasks.map((t) => t.title)).toEqual([
      "Guest task",
    ]);
    expect(useApp.getState().profile.name).toBe("Guest");
    useApp.getState().switchOwner("bob");
    expect(useApp.getState().records.tasks).toHaveLength(0);
    useApp.getState().switchOwner("alice");
    expect(useApp.getState().records.tasks[0]?.title).toBe("Private");
  });
  it("rejects records for a different owner", () => {
    useApp.getState().put("tasks", {
      ...owned(),
      user_id: "other",
      title: "Wrong",
      completed: false,
      completed_at: null,
    });
    expect(useApp.getState().records.tasks).toHaveLength(0);
  });
  it("stores only the latest mutation per record and retains delete tombstones", () => {
    useApp.getState().switchOwner("alice");
    const row = {
      ...owned(),
      title: "Task",
      completed: false,
      completed_at: null,
    };
    useApp.getState().put("tasks", row);
    useApp.getState().put("tasks", { ...row, title: "Changed" });
    expect(useApp.getState().pending).toHaveLength(1);
    expect(useApp.getState().pending[0]?.operation).toBe("upsert");
    useApp.getState().remove("tasks", row.id);
    expect(useApp.getState().records.tasks).toHaveLength(0);
    expect(useApp.getState().pending).toHaveLength(1);
    expect(useApp.getState().pending[0]?.operation).toBe("delete");
  });
  it("does not queue server mutations for guests", () => {
    useApp.getState().put("tasks", {
      ...owned(),
      title: "Local",
      completed: false,
      completed_at: null,
    });
    expect(useApp.getState().pending).toHaveLength(0);
  });
});
