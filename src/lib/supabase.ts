import 'react-native-url-polyfill/auto';
import { createClient, processLock } from '@supabase/supabase-js';
import type { Database } from './models';
import { storage } from './storage';
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient<Database>(url, key, {
  auth: { storage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, lock: processLock },
}) : null;
