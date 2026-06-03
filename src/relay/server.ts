import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import type { IncomingMessage } from 'http';

interface Session {
  agent:   WebSocket | null;
  browser: WebSocket | null;
}

const sessions = new Map<string, Session>();

function sess(id: string): Session {
  if (!sessions.has(id)) sessions.set(id, { agent: null, browser: null });
  return sessions.get(id)!;
}

function fwd(target: WebSocket | null, data: string) {
  if (target?.readyState === WebSocket.OPEN) target.send(data);
}

export function startRelayServer(port = 3422) {
  const http = createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', sessions: sessions.size }));
      return;
    }
    res.writeHead(404); res.end();
  });

  const wss = new WebSocketServer({ server: http });

  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const url    = new URL(req.url ?? '/', 'http://x');
    const role   = url.pathname.slice(1) as 'agent' | 'browser';
    const sid    = url.searchParams.get('session') ?? '';
    const other  = role === 'agent' ? 'browser' : 'agent';

    if ((role !== 'agent' && role !== 'browser') || !sid) {
      ws.close(4000, 'Bad request'); return;
    }

    const s = sess(sid);
    if (s[role]) { ws.close(4001, `${role} already connected`); return; }

    s[role] = ws;

    // Notify both ends when the pair is complete
    if (s[other]?.readyState === WebSocket.OPEN) {
      fwd(s[other], JSON.stringify({ type: 'peer_connected' }));
      fwd(ws,       JSON.stringify({ type: 'peer_connected' }));
    }

    ws.on('message', (data) => fwd(s[other], data.toString()));

    ws.on('close', () => {
      s[role] = null;
      fwd(s[other], JSON.stringify({ type: 'peer_disconnected' }));
      if (!s.agent && !s.browser) sessions.delete(sid);
    });

    ws.on('error', () => {});
  });

  http.listen(port);
  return http;
}
