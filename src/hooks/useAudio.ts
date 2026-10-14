import { useCallback, useEffect, useRef, useState } from "react";
import { AudioPlayback, idleAudioState } from "../services/audioPlayback";

export function useAudio() {
  const controller = useRef<AudioPlayback | null>(null);
  const [state, setState] = useState(idleAudioState);
  useEffect(() => {
    const playback = new AudioPlayback(setState);
    controller.current = playback;
    return () => {
      playback.dispose();
      if (controller.current === playback) controller.current = null;
    };
  }, []);
  const play = useCallback(async (number: number, uri: string) => {
    await controller.current?.play(number, uri);
  }, []);
  const stop = useCallback(async () => {
    controller.current?.stop();
  }, []);
  return { ...state, play, stop };
}
