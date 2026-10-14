import { supabase } from '../lib/supabase';
// Private Storage integration for future user-provided assets; no upload UI in Part 1.
export async function uploadPrivateAsset(filename: string, bytes: ArrayBuffer, contentType: 'image/jpeg' | 'image/png') {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error('Sign in before uploading.');
  if (!/^[a-zA-Z0-9_-]+\.(jpg|jpeg|png)$/.test(filename)) throw new Error('Invalid asset filename.');
  const path = `${data.user.id}/${filename}`;
  const result = await supabase.storage.from('user-assets').upload(path, bytes, { contentType, upsert: true });
  if (result.error) throw result.error;
  return result.data.path;
}
export async function privateAssetUrl(path: string) {
  if (!supabase) throw new Error('Supabase is not configured.');
  const { data, error } = await supabase.storage.from('user-assets').createSignedUrl(path, 60);
  if (error) throw error;
  return data.signedUrl;
}
