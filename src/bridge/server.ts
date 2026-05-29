import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage as HttpRequest } from 'http';
import { hostname } from 'os';
import { readFileSync } from 'fs';
import { resolvePackagePath } from '../utils/packageRoot';
import { handleMessage } from './handlers';
import { ConnectedPayload, OutgoingMessage } from './types';

function getVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(resolvePackagePath('package.json'), 'utf-8'));
    return pkg.version || 'unknown';
  } catch {
    return 'unknown';
  }
}

export interface BridgeServer {
  port: number;
  close(): void;
}

export function startBridgeServer(token: string, port = 3421): BridgeServer {
  const wss = new WebSocketServer({ host: '127.0.0.1', port });

  wss.on('connection', (ws: WebSocket, req: HttpRequest) => {
    // Validate session token from query string
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (url.searchParams.get('token') !== token) {
      ws.close(4001, 'Unauthorized');
      return;
    }

    const connected: ConnectedPayload = {
      version: getVersion(),
      platform: process.platform,
      hostname: hostname()
    };
    send(ws, { type: 'connected', payload: connected });

    ws.on('message', async (data: Buffer) => {
      try {
        const msg = JSON.parse(data.toString());
        await handleMessage(msg, (out: OutgoingMessage) => send(ws, out));
      } catch (err) {
        send(ws, {
          type: 'error',
          payload: { message: err instanceof Error ? err.message : String(err) }
        });
      }
    });

    ws.on('error', () => {});
  });

  wss.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`  Port ${port} is already in use. Try: alph connect --port <other>`);
    } else {
      console.error(`  Bridge error: ${err.message}`);
    }
    process.exit(1);
  });

  return {
    port,
    close() { wss.close(); }
  };
}

function send(ws: WebSocket, msg: OutgoingMessage): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}
