import { randomUUID } from 'crypto';
import { exec } from 'child_process';
import { startBridgeServer } from '../bridge/server';

export interface ConnectCommandOptions {
  port?: number;
  noOpen?: boolean;
}

const WEB_UI_BASE = 'https://djdhananjay1.github.io/Alph';

function openBrowser(url: string): void {
  let cmd: string;
  if (process.platform === 'win32') {
    cmd = `start "" "${url}"`;
  } else if (process.platform === 'darwin') {
    cmd = `open "${url}"`;
  } else {
    cmd = `xdg-open "${url}"`;
  }
  exec(cmd, () => {});
}

function line(char = '─', len = 52): string {
  return '  ' + char.repeat(len);
}

export async function executeConnectCommand(options: ConnectCommandOptions = {}): Promise<void> {
  const token = randomUUID();
  const port = options.port ?? 3421;

  // Start bridge — exits process on port conflict
  const server = startBridgeServer(token, port);

  const webUrl = `${WEB_UI_BASE}/#token=${token}&port=${port}`;

  console.log('');
  console.log(line('─'));
  console.log('  Alph Bridge — ready');
  console.log(line('─'));
  console.log(`  Bridge   ws://127.0.0.1:${port}`);
  console.log(`  Token    ${token}`);
  console.log(`  Web UI   ${webUrl}`);
  console.log(line('─'));
  console.log('  Opening browser... Press Ctrl+C to stop.');
  console.log('');

  if (!options.noOpen) {
    openBrowser(webUrl);
  }

  // Block until SIGINT/SIGTERM
  await new Promise<void>(resolve => {
    const shutdown = () => {
      console.log('\n  Bridge stopped.');
      server.close();
      resolve();
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  });
}
