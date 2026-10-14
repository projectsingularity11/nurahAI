import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { supabase } from '../lib/supabase';
import { useApp } from '../store/app';
import { syncAccount } from '../services/sync';
export function useRuntime() {
  const hydrated = useApp((s) => s.hydrated);
  useEffect(() => {
    if (!hydrated) return;
    const unsubscribeNetwork = NetInfo.addEventListener((state) => {
      const online = state.isConnected !== false && state.isInternetReachable !== false;
      useApp.getState().setOnline(online);
      if (online) void syncAccount();
    });
    let active = true;
    let observedAuthEvent = false;
    const subscription = supabase?.auth.onAuthStateChange((_event, session) => {
      observedAuthEvent = true;
      useApp.getState().switchOwner(session?.user.id ?? 'guest');
      // Never await Supabase calls inside its auth-state callback (auth lock).
      setTimeout(() => { if (active) void syncAccount(); }, 0);
    });
    void supabase?.auth.getSession().then(({ data, error }) => {
      if (!active || observedAuthEvent) return;
      if (error) { useApp.setState({ syncError: error.message }); return; }
      useApp.getState().switchOwner(data.session?.user.id ?? 'guest');
      void syncAccount();
    });
    const foreground = AppState.addEventListener('change', (state) => {
      if (state === 'active') { if (Platform.OS !== 'web') supabase?.auth.startAutoRefresh(); void syncAccount(); }
      else if (Platform.OS !== 'web') supabase?.auth.stopAutoRefresh();
    });
    const interval = setInterval(() => { void syncAccount(); }, 30000);
    const unsubscribeChanges = useApp.subscribe((s, before) => {
      if (s.pending !== before.pending || s.profileRevision !== before.profileRevision) void syncAccount();
    });
    return () => { active = false; unsubscribeNetwork(); subscription?.data.subscription.unsubscribe(); foreground.remove(); unsubscribeChanges(); clearInterval(interval); };
  }, [hydrated]);
}
