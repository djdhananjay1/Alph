import { startRelayServer } from '../relay/server';

export interface RelayCommandOptions {
  port?: number;
}

function line(char = '─', len = 52) { return '  ' + char.repeat(len); }

export async function executeRelayCommand(options: RelayCommandOptions = {}): Promise<void> {
  const port   = options.port ?? 3422;
  const server = startRelayServer(port);

  console.log('');
  console.log(line());
  console.log('  Alph Relay — running');
  console.log(line());
  console.log(`  Agent WS    ws://0.0.0.0:${port}/agent`);
  console.log(`  Browser WS  ws://0.0.0.0:${port}/browser`);
  console.log(`  Health      http://localhost:${port}/health`);
  console.log(line());
  console.log('  Deploy on any VPS then set ALPH_RELAY_URL=wss://your-domain.com');
  console.log('  Usage: alph connect --relay wss://your-domain.com');
  console.log('  Press Ctrl+C to stop.');
  console.log('');

  await new Promise<void>(resolve => {
    const shutdown = () => { server.close(); resolve(); };
    process.once('SIGINT',  shutdown);
    process.once('SIGTERM', shutdown);
  });
}
