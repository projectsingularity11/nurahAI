import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioStatus,
} from "expo-audio";

export interface AudioPlaybackState {
  playing: number | null;
  loading: boolean;
  error: string;
}
export const idleAudioState: AudioPlaybackState = {
  playing: null,
  loading: false,
  error: "",
};
const LOAD_ERROR =
  "Audio could not be loaded. Check your connection and try again.";
const PLAYBACK_ERROR =
  "Audio playback failed. Check your connection and try again.";

// One player per reader. Own the listener, loading timeout and native resource together.
export class AudioPlayback {
  private player: AudioPlayer | null = null;
  private listener: { remove(): void } | null = null;
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private generation = 0;
  private disposed = false;
  private state: AudioPlaybackState = { ...idleAudioState };

  constructor(private readonly notify: (state: AudioPlaybackState) => void) {}

  private update(patch: Partial<AudioPlaybackState>) {
    if (this.disposed) return;
    this.state = { ...this.state, ...patch };
    this.notify(this.state);
  }

  private clearTimeout() {
    if (this.timeout !== null) clearTimeout(this.timeout);
    this.timeout = null;
  }

  private release() {
    this.clearTimeout();
    this.listener?.remove();
    this.listener = null;
    const previous = this.player;
    this.player = null;
    // Cleanup must be safe when the operating system has already released a player.
    try {
      previous?.remove();
    } catch {
      /* Already released. */
    }
  }

  stop() {
    this.generation++;
    this.release();
    this.update({ playing: null, loading: false });
  }

  dispose() {
    this.disposed = true;
    this.generation++;
    this.release();
  }

  async play(number: number, uri: string) {
    if (this.disposed) return;
    if (this.state.playing === number) {
      this.stop();
      return;
    }
    this.stop();
    const token = ++this.generation;
    this.update({ error: "", loading: true });
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: false,
        allowsRecording: false,
        interruptionMode: "doNotMix",
      });
      // Navigation, another verse, or unmount may cancel the request while audio mode loads.
      if (token !== this.generation || this.disposed) return;
      const player = createAudioPlayer({ uri }, { updateInterval: 250 });
      this.player = player;
      let started = false;
      const onStatus = (status: AudioStatus) => {
        if (token !== this.generation || this.disposed) return;
        if (status.error) {
          this.update({ error: PLAYBACK_ERROR });
          this.stop();
          return;
        }
        if (status.didJustFinish) {
          this.stop();
          return;
        }
        if (status.isLoaded) {
          this.clearTimeout();
          if (!started) {
            started = true;
            try {
              player.play();
            } catch {
              this.update({ error: PLAYBACK_ERROR });
              this.stop();
              return;
            }
          }
          this.update({
            loading: false,
            playing: status.playing ? number : null,
          });
        }
      };
      this.listener = player.addListener("playbackStatusUpdate", onStatus);
      this.timeout = setTimeout(() => {
        if (token !== this.generation || this.disposed) return;
        this.update({ error: LOAD_ERROR });
        this.stop();
      }, 15000);
      // On web, currentStatus can optimistically report loaded before media is ready.
      onStatus({ ...player.currentStatus, isLoaded: player.isLoaded });
    } catch {
      if (token === this.generation && !this.disposed) {
        this.update({ error: LOAD_ERROR });
        this.stop();
      }
    }
  }
}
