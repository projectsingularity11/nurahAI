import { useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';
export function useAudio() {
  const sound = useRef<Audio.Sound | null>(null); const generation = useRef(0);
  const [playing, setPlaying] = useState<number | null>(null); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  useEffect(() => () => { generation.current++; const current = sound.current; sound.current = null; void current?.unloadAsync().catch(() => undefined); }, []);
  async function stop() { generation.current++; const previous = sound.current; sound.current = null; setPlaying(null); setLoading(false); if (previous) await previous.unloadAsync().catch(() => undefined); }
  async function play(number: number, uri: string) {
    if (playing === number) { await stop(); return; }
    await stop(); const token = ++generation.current; setError(''); setLoading(true);
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
      const { sound: created } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true }, (status) => {
        if (token !== generation.current) return;
        if (status.isLoaded && status.didJustFinish) { setPlaying(null); void stop(); }
        else if (!status.isLoaded && status.error) { setError('Audio playback failed. Check your connection and try again.'); void stop(); }
      });
      if (token !== generation.current) { await created.unloadAsync(); return; }
      sound.current = created; setPlaying(number);
    } catch { if (token === generation.current) setError('Audio could not be loaded. Check your connection and try again.'); }
    finally { if (token === generation.current) setLoading(false); }
  }
  return { playing, loading, error, play, stop };
}
