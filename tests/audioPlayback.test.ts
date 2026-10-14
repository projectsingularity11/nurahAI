import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AudioStatus } from "expo-audio";
import {
  AudioPlayback,
  type AudioPlaybackState,
} from "../src/services/audioPlayback";
const mocks = vi.hoisted(() => ({ create: vi.fn(), setMode: vi.fn() }));
vi.mock("expo-audio", () => ({
  createAudioPlayer: mocks.create,
  setAudioModeAsync: mocks.setMode,
}));
function status(patch: Partial<AudioStatus> = {}): AudioStatus {
  return {
    id: "test-player",
    currentTime: 0,
    playbackState: "loading",
    timeControlStatus: "waiting",
    reasonForWaitingToPlay: "",
    mute: false,
    duration: 3,
    playing: false,
    loop: false,
    didJustFinish: false,
    isBuffering: true,
    isLoaded: false,
    playbackRate: 1,
    shouldCorrectPitch: false,
    isLive: false,
    currentOffsetFromLive: null,
    error: null,
    ...patch,
  };
}
class FakePlayer {
  currentStatus = status();
  isLoaded = false;
  callback: ((status: AudioStatus) => void) | null = null;
  removeListener = vi.fn();
  remove = vi.fn();
  play = vi.fn();
  addListener = vi.fn(
    (_event: string, callback: (status: AudioStatus) => void) => {
      this.callback = callback;
      return { remove: this.removeListener };
    },
  );
  emit(patch: Partial<AudioStatus>) {
    this.currentStatus = status(patch);
    if (patch.isLoaded !== undefined) this.isLoaded = patch.isLoaded;
    this.callback?.(this.currentStatus);
  }
}
let players: FakePlayer[];
let updates: AudioPlaybackState[];
let playback: AudioPlayback;
const latest = () => updates.at(-1);
beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  players = [];
  updates = [];
  mocks.setMode.mockResolvedValue(undefined);
  mocks.create.mockImplementation(() => {
    const player = new FakePlayer();
    players.push(player);
    return player;
  });
  playback = new AudioPlayback((state) => updates.push(state));
});
afterEach(() => {
  playback.dispose();
  vi.useRealTimers();
});
describe("SDK 57 Qur’an audio lifecycle", () => {
  it("loads, starts, and configures playback without recording or background audio", async () => {
    await playback.play(1, "https://example.com/ayah.mp3");
    expect(latest()?.loading).toBe(true);
    expect(mocks.setMode).toHaveBeenCalledWith(
      expect.objectContaining({
        playsInSilentMode: true,
        allowsRecording: false,
        shouldPlayInBackground: false,
      }),
    );
    players[0]!.emit({ isLoaded: true, playing: true });
    expect(latest()).toEqual({ playing: 1, loading: false, error: "" });
  });
  it("waits for the player to load when web status is optimistically ready", async () => {
    const player = new FakePlayer();
    player.currentStatus = status({ isLoaded: true });
    mocks.create.mockReturnValueOnce(player);
    await playback.play(1, "https://example.com/1.mp3");
    expect(player.play).not.toHaveBeenCalled();
    expect(latest()?.loading).toBe(true);
    player.emit({ isLoaded: true, playing: true });
    expect(player.play).toHaveBeenCalledOnce();
  });
  it("stops when the active verse is tapped again", async () => {
    await playback.play(1, "https://example.com/1.mp3");
    players[0]!.emit({ isLoaded: true, playing: true });
    await playback.play(1, "https://example.com/1.mp3");
    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(players[0]!.remove).toHaveBeenCalledOnce();
    expect(players[0]!.removeListener).toHaveBeenCalledOnce();
    expect(latest()?.playing).toBeNull();
  });
  it("releases the previous verse and ignores its late status events", async () => {
    await playback.play(1, "https://example.com/1.mp3");
    await playback.play(2, "https://example.com/2.mp3");
    players[1]!.emit({ isLoaded: true, playing: true });
    players[0]!.emit({ isLoaded: true, playing: true });
    expect(latest()?.playing).toBe(2);
    expect(players[0]!.remove).toHaveBeenCalledOnce();
  });
  it("returns to idle and releases resources when playback finishes", async () => {
    await playback.play(1, "https://example.com/1.mp3");
    players[0]!.emit({ isLoaded: true, didJustFinish: true });
    expect(latest()).toEqual({ playing: null, loading: false, error: "" });
    expect(players[0]!.remove).toHaveBeenCalledOnce();
  });
  it("shows a retryable error and releases a failed player", async () => {
    await playback.play(1, "https://example.com/1.mp3");
    players[0]!.emit({ error: "Network failure" });
    expect(latest()?.error).toContain("Audio playback failed");
    expect(latest()?.loading).toBe(false);
    expect(players[0]!.remove).toHaveBeenCalledOnce();
  });
  it("handles synchronous player creation errors without a stuck spinner", async () => {
    mocks.create.mockImplementationOnce(() => {
      throw new Error("Audio unavailable");
    });
    await playback.play(1, "https://example.com/1.mp3");
    expect(latest()?.error).toContain("Audio could not be loaded");
    expect(latest()?.loading).toBe(false);
  });
  it("cancels a pending start when leaving the reader", async () => {
    let resolve!: () => void;
    mocks.setMode.mockImplementationOnce(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    );
    const pending = playback.play(1, "https://example.com/1.mp3");
    playback.stop();
    resolve();
    await pending;
    expect(mocks.create).not.toHaveBeenCalled();
    expect(latest()?.playing).toBeNull();
  });
  it("does not update an unmounted reader or start after disposal", async () => {
    await playback.play(1, "https://example.com/1.mp3");
    playback.dispose();
    const count = updates.length;
    players[0]!.emit({ isLoaded: true, playing: true });
    await playback.play(2, "https://example.com/2.mp3");
    expect(updates).toHaveLength(count);
    expect(mocks.create).toHaveBeenCalledTimes(1);
    expect(players[0]!.remove).toHaveBeenCalledOnce();
  });
  it("times out a failed load instead of spinning indefinitely", async () => {
    await playback.play(1, "https://example.com/1.mp3");
    vi.advanceTimersByTime(15000);
    expect(latest()?.error).toContain("Audio could not be loaded");
    expect(latest()?.loading).toBe(false);
    expect(players[0]!.remove).toHaveBeenCalledOnce();
  });
});
