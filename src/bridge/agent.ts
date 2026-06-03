import WebSocket from 'ws';
import { readFileSync } from 'fs';
import { hostname } from 'os';
import { resolvePackagePath } from '../utils/packageRoot';
import { handleMessage } from './handlers';
import type { OutgoingMessage } from './types';

function getVersion(): string {
  try {
    return JSON.parse(readFileSync(resolvePackagePath('package.json'), 'utf-8')).version ?? 'unknown';
  } catch { return 'unknown'; }
}

function send(ws: WebSocket, msg: OutgoingMessage) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(msg));
}

export interface AgentHandle {
  waitForBrowser(): Promise<void>;
  close(): void;
}

/**
 * Connect this machine to the relay as an "agent".
 * Resolves once the WebSocket to the relay is open (before any browser connects).
 * Call waitForBrowser() to await the first browser pairing.
 */
export function connectAgentToRelay(sessionId: string, relayUrl: string): Promise<AgentHandle> {
  return new Promise((resolve, reject) => {
    const url = `${relayUrl}/agent?session=${sessionId}`;
    const ws  = new WebSocket(url);

    let browserResolve: (() => void) | null = null;
    const browserPaired = new Promise<void>(r => { browserResolve = r; });

    ws.on('open', () => {
      // Agent is registered with relay — safe to print URL / open browser now
      resolve({
        waitForBrowser: () => browserPaired,
        close: () => ws.close(),
      });
    });

    ws.on('message', async (raw: Buffer) => {
      let msg: any;
      try { msg = JSON.parse(raw.toString()); } catch { return; }

      if (msg.type === 'peer_connected') {
        // Browser just joined the session — send the handshake
        send(ws, {
          type: 'connected',
          payload: { version: getVersion(), platform: process.platform, hostname: hostname() },
        });
        browserResolve?.();
        return;
      }

      if (msg.type === 'peer_disconnected') {
        console.log('\n  Browser disconnected from relay.');
        return;
      }

      // All other messages: route through existing handlers
      try {
        await handleMessage(msg, (out: OutgoingMessage) => send(ws, out));
      } catch (err) {
        send(ws, { type: 'error', payload: { message: String(err) } });
      }
    });

    ws.on('error', (err) => reject(new Error(`Cannot reach relay at ${relayUrl}: ${err.message}`)));

    ws.on('close', (code) => {
      if (code === 4001) reject(new Error('Relay rejected connection: session already in use'));
    });
  });
}
