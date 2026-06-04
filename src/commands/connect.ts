import { randomUUID } from 'crypto';
import { exec } from 'child_process';
import { startBridgeServer } from '../bridge/server';
import { startSupabaseRelay } from '../relay/supabase-relay';

export interface ConnectCommandOptions {
  port?: number;
  noOpen?: boolean;
  noRelay?: boolean;
}

const WEB_UI_BASE = 'https://djdhananjay1.github.io/Alph';

function openBrowser(url: string): void {
  const cmds: Partial<Record<string, string>> = {
    win32:  `start "" "${url}"`,
    darwin: `open "${url}"`,
  };
  exec(cmds[process.platform] ?? `xdg-open "${url}"`, () => {});
}

function line(char = '─', len = 52): string {
  return '  ' + char.repeat(len);
}

export async function executeConnectCommand(options: ConnectCommandOptions = {}): Promise<void> {
  const token = randomUUID();
  const port  = options.port ?? 3421;

  const server = startBridgeServer(token, port);
  const relay  = options.noRelay ? { ready: false, close: async () => {} } : startSupabaseRelay(token);

  const webUrl = `${WEB_UI_BASE}/connect#token=${token}&port=${port}`;

  console.log('');
  console.log(line());
  console.log('  Alph Bridge — ready');
  console.log(line());
  console.log(`  Local    ws://127.0.0.1:${port}`);
  if (relay.ready) {
    console.log('  Relay    Supabase (E2E encrypted)');
  }
  console.log(`  Token    ${token}`);
  console.log(`  Web UI   ${webUrl}`);
  console.log(line());
  if (!relay.ready && !options.noRelay) {
    console.log('  Tip: set ALPH_SUPABASE_URL + ALPH_SUPABASE_ANON_KEY for encrypted relay');
  }
  console.log('  Opening browser... Press Ctrl+C to stop.');
  console.log('');

  if (!options.noOpen) {
    openBrowser(webUrl);
  }

  await new Promise<void>(resolve => {
    const shutdown = async () => {
      console.log('\n  Bridge stopped.');
      server.close();
      await relay.close();
      resolve();
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  });
}
