import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { deriveKey, encrypt, decrypt } from './crypto';

type MsgHandler = (payload: any) => void;

export type AgentInfo = {
  name: string;
  detected: boolean;
  configPath?: string;
  error?: string;
};

export type LogEntry = {
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  timestamp: string;
};

export type OperationResult = {
  success: boolean;
  message?: string;
  error?: string;
};

export type ConnectedInfo = {
  version: string;
  platform: string;
  hostname: string;
};

export type ConnectionMode = 'local' | 'relay';

const SESSION_KEY = 'alph_bridge';

type SavedSession =
  | { mode: 'local'; token: string; port: number }
  | { mode: 'relay'; token: string };

class BridgeClient {
  private ws: WebSocket | null = null;
  private channel: RealtimeChannel | null = null;
  private cryptoKey: CryptoKey | null = null;
  private handlers = new Map<string, MsgHandler[]>();
  private _connected = false;
  private _connInfo: ConnectedInfo | null = null;
  private _mode: ConnectionMode | null = null;

  get connected() { return this._connected; }
  get connInfo()  { return this._connInfo; }
  get mode()      { return this._mode; }

  // ── Local WebSocket ───────────────────────────────────────────────────────

  connect(token: string, port = 3421): Promise<ConnectedInfo> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(`ws://127.0.0.1:${port}?token=${token}`);
      this.ws = ws;

      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data);
        if (msg.type === 'connected') {
          this._connected = true;
          this._connInfo  = msg.payload as ConnectedInfo;
          this._mode      = 'local';
          sessionStorage.setItem(SESSION_KEY, JSON.stringify({ mode: 'local', token, port } satisfies SavedSession));
          resolve(this._connInfo);
        }
        this.emit(msg.type, msg.payload);
      };

      ws.onerror = () => {
        this._connected = false;
        reject(new Error('Could not reach local bridge. Is "alph connect" running?'));
      };

      ws.onclose = (e) => {
        this._connected = false;
        this._connInfo  = null;
        this._mode      = null;
        if (e.code === 4001) reject(new Error('Invalid session token'));
        this.emit('disconnected', {});
      };
    });
  }

  // ── Supabase Encrypted Relay ──────────────────────────────────────────────

  connectRelay(token: string): Promise<ConnectedInfo> {
    return new Promise(async (resolve, reject) => {
      try {
        const key = await deriveKey(token);
        this.cryptoKey = key;

        const ch = supabase.channel(`bridge:${token}`, {
          config: { broadcast: { self: false } }
        });
        this.channel = ch;

        const timer = setTimeout(() => {
          ch.unsubscribe();
          reject(new Error('Relay timeout — is the bridge running with ALPH_SUPABASE_URL set?'));
        }, 20_000);

        ch
          .on('broadcast', { event: 'msg' }, async ({ payload }) => {
            try {
              const plain = await decrypt(key, payload.d as string);
              const msg   = JSON.parse(plain);
              if (msg.type === 'connected') {
                clearTimeout(timer);
                this._connected = true;
                this._connInfo  = msg.payload as ConnectedInfo;
                this._mode      = 'relay';
                sessionStorage.setItem(SESSION_KEY, JSON.stringify({ mode: 'relay', token } satisfies SavedSession));
                resolve(this._connInfo);
              }
              this.emit(msg.type, msg.payload);
            } catch { /* tampered or old message — discard */ }
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              // Send hello handshake so CLI responds with connected
              try {
                const d = await encrypt(key, JSON.stringify({ type: 'hello' }));
                ch.send({ type: 'broadcast', event: 'msg', payload: { d } });
              } catch { /* ignore */ }
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
              clearTimeout(timer);
              reject(new Error('Relay channel error — check Supabase credentials'));
            }
          });
      } catch (err) {
        reject(err);
      }
    });
  }

  // ── Session management ────────────────────────────────────────────────────

  async tryReconnect(): Promise<ConnectedInfo | null> {
    if (this._connected) return this._connInfo;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const saved = JSON.parse(raw) as SavedSession;
      if (saved.mode === 'local') return await this.connect(saved.token, saved.port);
      return await this.connectRelay(saved.token);
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  disconnect() {
    sessionStorage.removeItem(SESSION_KEY);
    this.ws?.close();
    this.ws = null;
    this.channel?.unsubscribe();
    this.channel   = null;
    this.cryptoKey = null;
    this._connected = false;
    this._connInfo  = null;
    this._mode      = null;
  }

  // ── Message send ──────────────────────────────────────────────────────────

  send(msg: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
      return;
    }
    if (this.channel && this.cryptoKey) {
      const key = this.cryptoKey;
      const ch  = this.channel;
      encrypt(key, JSON.stringify(msg)).then(d => {
        ch.send({ type: 'broadcast', event: 'msg', payload: { d } });
      });
    }
  }

  // ── Event bus ─────────────────────────────────────────────────────────────

  on(type: string, handler: MsgHandler) {
    if (!this.handlers.has(type)) this.handlers.set(type, []);
    this.handlers.get(type)!.push(handler);
    return () => this.off(type, handler);
  }

  off(type: string, handler: MsgHandler) {
    const list = this.handlers.get(type) ?? [];
    this.handlers.set(type, list.filter(h => h !== handler));
  }

  private emit(type: string, payload: any) {
    this.handlers.get(type)?.forEach(h => h(payload));
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  detectAgents(): Promise<AgentInfo[]> {
    return new Promise(resolve => {
      const off = this.on('agents', (p) => { off(); resolve(p); });
      this.send({ type: 'detect_agents' });
    });
  }

  getStatus(): Promise<AgentInfo[]> {
    return new Promise(resolve => {
      const off = this.on('status', (p) => { off(); resolve(p); });
      this.send({ type: 'get_status' });
    });
  }

  configure(payload: object, onLog?: (entry: LogEntry) => void): Promise<OperationResult> {
    return new Promise(resolve => {
      const offResult = this.on('configure_result', (p) => { offLog(); offResult(); resolve(p); });
      const offLog    = onLog ? this.on('log', onLog) : () => {};
      this.send({ type: 'configure', payload });
    });
  }

  remove(payload: object, onLog?: (entry: LogEntry) => void): Promise<OperationResult> {
    return new Promise(resolve => {
      const offResult = this.on('remove_result', (p) => { offLog(); offResult(); resolve(p); });
      const offLog    = onLog ? this.on('log', onLog) : () => {};
      this.send({ type: 'remove', payload });
    });
  }
}

export const bridge = new BridgeClient();
