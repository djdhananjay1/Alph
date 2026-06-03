import { randomUUID } from 'crypto';
import { exec } from 'child_process';
import { startBridgeServer } from '../bridge/server';
import { connectAgentToRelay } from '../bridge/agent';

export interface ConnectCommandOptions {
  port?:   number;
  noOpen?: boolean;
  relay?:  string;   // relay URL, e.g. wss://relay.example.com
}

const WEB_UI_BASE = 'https://djdhananjay1.github.io/Alph';

function openBrowser(url: string): void {
  const cmd =
    process.platform === 'win32' ? `start "" "${url}"` :
    process.platform === 'darwin' ? `open "${url}"` :
    `xdg-open "${url}"`;
  exec(cmd, () => {});
}

function line(char = '─', len = 52): string { return '  ' + char.repeat(len); }

// ── Relay mode ──────────────────────────────────────────────────────────────

async function connectViaRelay(options: ConnectCommandOptions): Promise<void> {
  const relayUrl  = options.relay!;
  const sessionId = randomUUID();

  console.log('');
  console.log(line());
  console.log('  Alph Bridge — connecting to relay…');
  console.log(line());

  let agent;
  try {
    agent = await connectAgentToRelay(sessionId, relayUrl);
  } catch (err) {
    console.error(`\n  ✗ ${(err as Error).message}`);
    process.exit(1);
  }

  const webUrl = `${WEB_UI_BASE}/connect#session=${sessionId}&relay=${encodeURIComponent(relayUrl)}`;

  console.log(`  Relay    ${relayUrl}`);
  console.log(`  Session  ${sessionId}`);
  console.log(`  Web UI   ${webUrl}`);
  console.log(line());
  console.log('  Opening browser… Press Ctrl+C to stop.');
  console.log('');

  if (!options.noOpen) openBrowser(webUrl);

  // Notify when browser pairs
  agent.waitForBrowser().then(() => {
    console.log('  ✓ Browser connected via relay.');
  });

  await new Promise<void>(resolve => {
    const shutdown = () => { console.log('\n  Bridge stopped.'); agent.close(); resolve(); };
    process.once('SIGINT',  shutdown);
    process.once('SIGTERM', shutdown);
  });
}

// ── Local mode (original behaviour) ─────────────────────────────────────────

async function connectLocal(options: ConnectCommandOptions): Promise<void> {
  const token = randomUUID();
  const port  = options.port ?? 3421;
  const server = startBridgeServer(token, port);

  const webUrl = `${WEB_UI_BASE}/connect#token=${token}&port=${port}`;

  console.log('');
  console.log(line());
  console.log('  Alph Bridge — ready');
  console.log(line());
  console.log(`  Bridge   ws://127.0.0.1:${port}`);
  console.log(`  Token    ${token}`);
  console.log(`  Web UI   ${webUrl}`);
  console.log(line());
  console.log('  Opening browser… Press Ctrl+C to stop.');
  console.log('');

  if (!options.noOpen) openBrowser(webUrl);

  await new Promise<void>(resolve => {
    const shutdown = () => { console.log('\n  Bridge stopped.'); server.close(); resolve(); };
    process.once('SIGINT',  shutdown);
    process.once('SIGTERM', shutdown);
  });
}

// ── Entry point ──────────────────────────────────────────────────────────────

export async function executeConnectCommand(options: ConnectCommandOptions = {}): Promise<void> {
  const relayUrl = options.relay ?? process.env['ALPH_RELAY_URL'];
  if (relayUrl) {
    await connectViaRelay({ ...options, relay: relayUrl });
  } else {
    await connectLocal(options);
  }
}
