import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseReady = !!(url && key);

// Safe client — only created when env vars are present
export const supabase: SupabaseClient = supabaseReady
  ? createClient(url!, key!)
  : ({
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signUp: async () => ({ data: {}, error: { message: 'Auth not configured' } }),
        signInWithPassword: async () => ({ data: {}, error: { message: 'Auth not configured' } }),
        signOut: async () => ({ error: null }),
      },
    } as any);

export async function signUp(email: string, password: string) {
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  return supabase.auth.getSession();
}
