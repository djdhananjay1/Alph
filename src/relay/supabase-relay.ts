import { createClient, type RealtimeChannel } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { hostname } from 'os';
import { deriveKey, encrypt, decrypt } from '../bridge/crypto';
import { handleMessage } from '../bridge/handlers';
import type { OutgoingMessage, IncomingMessage } from '../bridge/types';
import { resolvePackagePath } from '../utils/packageRoot';

const SUPABASE_URL      = process.env['ALPH_SUPABASE_URL']      ?? '';
const SUPABASE_ANON_KEY = process.env['ALPH_SUPABASE_ANON_KEY'] ?? '';

function getVersion(): string {
  try {
    return (JSON.parse(readFileSync(resolvePackagePath('package.json'), 'utf-8')) as { version?: string }).version ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

export interface SupabaseRelay {
  readonly ready: boolean;
  close(): Promise<void>;
}

export function startSupabaseRelay(token: string): SupabaseRelay {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { ready: false, close: async () => {} };
  }

  const key      = deriveKey(token);
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    realtime: { params: { eventsPerSecond: 20 } }
  });
  let channel: RealtimeChannel;

  const sendEncrypted = (msg: OutgoingMessage): void => {
    try {
      channel.send({
        type:    'broadcast',
        event:   'msg',
        payload: { d: encrypt(key, JSON.stringify(msg)) }
      });
    } catch { /* best-effort; ignore send errors on relay */ }
  };

  channel = supabase
    .channel(`bridge:${token}`, { config: { broadcast: { self: false } } })
    .on('broadcast', { event: 'msg' }, async ({ payload }) => {
      try {
        const plain = decrypt(key, payload.d as string);
        const msg   = JSON.parse(plain) as { type: string };

        // hello is a relay-internal handshake — respond with connected payload
        if (msg.type === 'hello') {
          sendEncrypted({
            type:    'connected',
            payload: { version: getVersion(), platform: process.platform, hostname: hostname() }
          });
          return;
        }

        await handleMessage(msg as IncomingMessage, sendEncrypted);
      } catch (err) {
        sendEncrypted({ type: 'error', payload: { message: String(err) } });
      }
    });

  channel.subscribe();

  return {
    ready: true,
    async close() {
      await supabase.removeChannel(channel);
    }
  };
}
